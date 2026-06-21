import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  GCChip,
  GCDash,
  GCEye,
  GCScreenHeader,
  GCTick,
  T,
} from "@/components/hud";
import { answer } from "@/src/ai/answer";
import { corpusSize, warmUp } from "@/src/ai/engine";
import type { Answer } from "@/src/ai/types";

const SUGGESTIONS = [
  "real-time chat",
  "biometric auth",
  "React Native performance",
  "Valt Connect",
];

export default function AskScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Answer | null>(null);
  const [loading, setLoading] = useState(false);

  // Warm up the on-device backends ahead of the first question.
  useEffect(() => warmUp(), []);

  // Debounced ask-as-you-type. All state updates run inside the timeout.
  useEffect(() => {
    const q = query.trim();
    let active = true;
    const id = setTimeout(() => {
      if (!active) return;
      if (!q) {
        setResult(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      answer(q, 6).then((res) => {
        if (!active) return;
        setResult(res);
        setLoading(false);
      });
    }, 200);
    return () => {
      active = false;
      clearTimeout(id);
    };
  }, [query]);

  const hits = result?.hits ?? [];

  return (
    <ScrollView
      testID="screen-ask"
      style={{ flex: 1, backgroundColor: T.paper }}
      contentContainerStyle={{ paddingBottom: 140 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar style="dark" />
      <View style={{ paddingTop: insets.top + 4 }} />

      <GCScreenHeader
        eyebrow="§ ASK MY PORTFOLIO"
        title="Ask."
        sub="Question the portfolio in plain words — retrieval + answer run fully on-device, offline."
        meta={`${corpusSize} DOCS`}
      />

      <View style={{ paddingHorizontal: 20, paddingTop: 4 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            borderWidth: 1,
            borderColor: T.ink,
            borderRadius: 14,
            paddingHorizontal: 14,
            paddingVertical: 12,
          }}
        >
          <Text
            style={{
              fontFamily: "JetBrainsMono_500Medium",
              fontSize: 15,
              color: T.red,
            }}
          >
            {">"}
          </Text>
          <TextInput
            testID="ask-input"
            value={query}
            onChangeText={setQuery}
            placeholder="e.g. does he have real-time chat experience?"
            placeholderTextColor={T.inkMid}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            style={{
              flex: 1,
              padding: 0,
              fontFamily: "DMSans_500Medium",
              fontSize: 15,
              color: T.ink,
            }}
          />
          {loading ? <ActivityIndicator size="small" color={T.red} /> : null}
        </View>

        {!query ? (
          <View
            style={{
              marginTop: 14,
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {SUGGESTIONS.map((s) => (
              <Pressable key={s} onPress={() => setQuery(s)}>
                <GCChip variant="ghost" size="xs">
                  {s}
                </GCChip>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>

      {/* Grounded answer */}
      {result?.text ? (
        <View style={{ paddingHorizontal: 20, paddingTop: 22 }}>
          <View
            style={{
              borderRadius: 16,
              backgroundColor: T.ink,
              padding: 18,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <GCEye tone="onDark">ANSWER</GCEye>
              <Text
                style={{
                  fontFamily: "JetBrainsMono_500Medium",
                  fontSize: 9,
                  letterSpacing: 0.9,
                  color: "rgba(246,244,237,0.55)",
                  textTransform: "uppercase",
                }}
              >
                {result.mode} · on-device
              </Text>
            </View>
            <Text
              style={{
                fontFamily: "DMSans_500Medium",
                fontSize: 16,
                lineHeight: 23,
                letterSpacing: -0.2,
                color: T.paper,
              }}
            >
              {result.text}
            </Text>
          </View>
        </View>
      ) : null}

      {/* Sources */}
      {hits.length > 0 ? (
        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          <View
            style={{
              marginBottom: 4,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <GCEye tone="red">§ SOURCES</GCEye>
            <GCTick>{`${hits.length} MATCHES`}</GCTick>
          </View>
          {hits.map((h) => (
            <Pressable
              key={h.doc.id}
              onPress={() => router.push(h.doc.route)}
              style={{ paddingVertical: 12 }}
            >
              <GCDash />
              <View
                style={{
                  marginTop: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <Text
                  style={{
                    flex: 1,
                    fontFamily: "DMSans_500Medium",
                    fontSize: 16,
                    letterSpacing: -0.3,
                    color: T.ink,
                  }}
                >
                  {h.doc.title}
                </Text>
                <GCChip variant="redSoft" size="xs">
                  {h.doc.kind}
                </GCChip>
              </View>
              {h.doc.meta ? (
                <Text
                  style={{
                    marginTop: 3,
                    fontFamily: "JetBrainsMono_500Medium",
                    fontSize: 10,
                    letterSpacing: 0.6,
                    color: T.inkMid,
                  }}
                >
                  {h.doc.meta}
                </Text>
              ) : null}
            </Pressable>
          ))}
        </View>
      ) : query && !loading ? (
        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          <GCEye tone="mid">No matches — try different words.</GCEye>
        </View>
      ) : null}
    </ScrollView>
  );
}
