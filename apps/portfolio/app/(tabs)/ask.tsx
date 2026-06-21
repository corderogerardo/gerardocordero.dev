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
import { corpusSize, search, warmUp } from "@/src/ai/engine";
import type { SearchHit, SearchMode } from "@/src/ai/types";

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
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [mode, setMode] = useState<SearchMode>("lexical");
  const [loading, setLoading] = useState(false);

  // Start loading the on-device embedder (web/native) ahead of the first query.
  useEffect(() => warmUp(), []);

  // Debounced search as the user types. All state updates run inside the
  // timeout (deferred) so we never setState synchronously within the effect.
  useEffect(() => {
    const q = query.trim();
    let active = true;
    const id = setTimeout(() => {
      if (!active) return;
      if (!q) {
        setHits([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      search(q, 6).then((res) => {
        if (!active) return;
        setHits(res.hits);
        setMode(res.mode);
        setLoading(false);
      });
    }, 180);
    return () => {
      active = false;
      clearTimeout(id);
    };
  }, [query]);

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
        eyebrow="§ ON-DEVICE SEARCH"
        title="Ask."
        sub="Search the portfolio by meaning — runs fully on your device, offline."
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
            placeholder="e.g. real-time chat, biometric auth…"
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

      {hits.length > 0 ? (
        <View style={{ paddingHorizontal: 20, paddingTop: 26 }}>
          <View
            style={{
              marginBottom: 4,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <GCEye tone="red">§ RESULTS</GCEye>
            <GCTick>
              {mode === "semantic" ? "SEMANTIC · ON-DEVICE" : "LEXICAL"}
            </GCTick>
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
        <View style={{ paddingHorizontal: 20, paddingTop: 26 }}>
          <GCEye tone="mid">No matches — try different words.</GCEye>
        </View>
      ) : null}
    </ScrollView>
  );
}
