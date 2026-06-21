import { View, Text, ScrollView, Pressable, Linking } from "react-native";
import { StatusBar } from "expo-status-bar";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { contactInfo, socialLinks } from "@/src/data/contact";
import { externalLinks } from "@/src/data/blog";
import {
  GCDash,
  GCDots,
  GCEye,
  GCScreenHeader,
  GCStatus,
  GCTick,
  T,
} from "@/components/hud";

const CONTACT_ICONS: Record<
  string,
  React.ComponentProps<typeof FontAwesome>["name"]
> = {
  Phone: "phone",
  Email: "envelope",
  English: "language",
};

function PrimaryEmailCard() {
  return (
    <Pressable
      onPress={() => Linking.openURL("mailto:cordero.gerard@gmail.com")}
      style={{
        width: "100%",
        padding: 22,
        borderRadius: 20,
        backgroundColor: T.ink,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 18,
        }}
      >
        <GCStatus color={T.red} label="CHANNEL 01 · PRIMARY" dark />
        <View
          style={{
            width: 32,
            height: 32,
            borderWidth: 1,
            borderColor: "rgba(246,244,237,0.3)",
            borderRadius: 9999,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "JetBrainsMono_500Medium",
              fontSize: 14,
              color: T.paper,
            }}
          >
            →
          </Text>
        </View>
      </View>
      <Text
        style={{
          fontFamily: "JetBrainsMono_500Medium",
          fontSize: 10,
          color: "rgba(246,244,237,0.55)",
          letterSpacing: 1.2,
          marginBottom: 8,
        }}
      >
        ADDRESS
      </Text>
      <Text
        style={{
          fontFamily: "DMSans_500Medium",
          fontSize: 28,
          letterSpacing: -0.95,
          lineHeight: 30,
          color: T.paper,
        }}
      >
        cordero.gerard@
      </Text>
      <Text
        style={{
          fontFamily: "DMSans_500Medium",
          fontSize: 28,
          letterSpacing: -0.95,
          lineHeight: 30,
          color: T.paper,
        }}
      >
        gmail.com
      </Text>
      <View style={{ marginTop: 18 }}>
        <GCDash color="rgba(246,244,237,0.22)" />
      </View>
      <View
        style={{
          marginTop: 14,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <GCEye tone="onDark">TAP TO COMPOSE</GCEye>
        <Text
          style={{
            fontFamily: "JetBrainsMono_500Medium",
            fontSize: 10,
            color: "rgba(246,244,237,0.55)",
            letterSpacing: 0.8,
          }}
        >
          REPLY &lt; 24H
        </Text>
      </View>
    </Pressable>
  );
}

function ContactLine({
  item,
  index,
  isLast,
}: {
  item: { label: string; value: string; href?: string };
  index: number;
  isLast: boolean;
}) {
  const hasHref = !!item.href;
  const icon = CONTACT_ICONS[item.label] ?? "envelope";
  return (
    <View>
    <Pressable
      onPress={() => item.href && Linking.openURL(item.href)}
      disabled={!hasHref}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        paddingVertical: 14,
      }}
    >
      <View style={{ width: 40 }}>
        <Text
          style={{
            fontFamily: "JetBrainsMono_500Medium",
            fontSize: 10,
            color: T.red,
            letterSpacing: 0.6,
          }}
        >
          · {String(index + 2).padStart(2, "0")}
        </Text>
        <FontAwesome
          name={icon}
          size={12}
          color={T.ink}
          style={{ marginTop: 4 }}
        />
      </View>
      <View style={{ flex: 1 }}>
        <GCEye>{item.label}</GCEye>
        <Text
          style={{
            marginTop: 2,
            fontFamily: "DMSans_500Medium",
            fontSize: 15,
            color: T.ink,
            letterSpacing: -0.15,
          }}
        >
          {item.value}
        </Text>
      </View>
      {hasHref ? (
        <Text
          style={{
            fontFamily: "JetBrainsMono_500Medium",
            fontSize: 13,
            color: T.red,
          }}
        >
          →
        </Text>
      ) : null}
    </Pressable>
    {isLast ? null : <GCDots />}
    </View>
  );
}

function SocialRow({
  item,
}: {
  item: { platform: string; url: string; icon: string };
}) {
  return (
    <Pressable
      onPress={() => Linking.openURL(item.url)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: T.inkHair,
        borderRadius: 14,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderWidth: 1,
          borderColor: T.ink,
          borderRadius: 6,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FontAwesome
          name={item.icon as React.ComponentProps<typeof FontAwesome>["name"]}
          size={14}
          color={T.ink}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: "DMSans_500Medium",
            fontSize: 15,
            letterSpacing: -0.15,
            color: T.ink,
          }}
        >
          {item.platform}
        </Text>
        <Text
          style={{
            marginTop: 1,
            fontFamily: "JetBrainsMono_500Medium",
            fontSize: 10,
            color: T.inkMid,
            letterSpacing: 0.6,
          }}
        >
          @
          {item.url
            .replace(/https?:\/\/(www\.)?[^/]+\//, "")
            .replace(/\/$/, "")
            .replace("in/", "")}
        </Text>
      </View>
      <Text
        style={{
          fontFamily: "JetBrainsMono_500Medium",
          fontSize: 12,
          color: T.red,
        }}
      >
        ↗
      </Text>
    </Pressable>
  );
}

export default function ContactScreen() {
  const insets = useSafeAreaInsets();

  const directLines = contactInfo;

  const elsewhere = Object.entries(externalLinks) as [string, string][];

  return (
    <ScrollView
      testID="screen-contact"
      style={{ flex: 1, backgroundColor: T.paper }}
      contentContainerStyle={{ paddingBottom: 140 }}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar style="dark" />
      <View style={{ paddingTop: insets.top + 4 }} />

      <GCScreenHeader
        eyebrow="§ OPEN TO CHAT"
        title="Comms."
        sub="Pick a channel. Email is the fastest path. Inbox is always on."
        meta="INBOX · 24/7"
      />

      {/* Primary email */}
      <View style={{ paddingHorizontal: 20, paddingTop: 4 }}>
        <PrimaryEmailCard />
      </View>

      {/* §02 Direct lines */}
      <View style={{ paddingHorizontal: 20, paddingTop: 28 }}>
        <View className="mb-2 flex-row items-center justify-between">
          <GCEye tone="red">§ 02 · DIRECT LINES</GCEye>
          <GCTick>
            {String(directLines.length).padStart(2, "0")} CHANNELS
          </GCTick>
        </View>
        {directLines.map((c, i) => (
          <ContactLine
            key={`${c.label}-${c.value}`}
            item={c}
            index={i}
            isLast={i === directLines.length - 1}
          />
        ))}
      </View>

      {/* §03 Social */}
      <View style={{ paddingHorizontal: 20, paddingTop: 28 }}>
        <View className="mb-3.5 flex-row items-center justify-between">
          <GCEye tone="red">§ 03 · SOCIAL</GCEye>
          <GCTick>
            {String(socialLinks.length).padStart(2, "0")} PLATFORMS
          </GCTick>
        </View>
        <View style={{ gap: 10 }}>
          {socialLinks.map((s) => (
            <SocialRow key={s.platform} item={s} />
          ))}
        </View>
      </View>

      {/* §04 Elsewhere */}
      <View style={{ paddingHorizontal: 20, paddingTop: 28 }}>
        <View className="mb-3 flex-row items-center justify-between">
          <GCEye tone="red">§ 04 · ELSEWHERE</GCEye>
          <GCTick>EXTERNAL</GCTick>
        </View>
        <View>
          {elsewhere.map(([label, url], i) => (
            <View key={label}>
            <Pressable
              onPress={() => Linking.openURL(url)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 14,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <Text
                  style={{
                    fontFamily: "JetBrainsMono_500Medium",
                    fontSize: 10,
                    color: T.red,
                    letterSpacing: 0.6,
                    width: 24,
                  }}
                >
                  · {String(i + 1).padStart(2, "0")}
                </Text>
                <View>
                  <Text
                    style={{
                      fontFamily: "DMSans_500Medium",
                      fontSize: 15,
                      letterSpacing: -0.15,
                      color: T.ink,
                      textTransform: "capitalize",
                    }}
                  >
                    {label}
                  </Text>
                  <Text
                    style={{
                      marginTop: 1,
                      fontFamily: "JetBrainsMono_500Medium",
                      fontSize: 10,
                      color: T.inkMid,
                      letterSpacing: 0.4,
                    }}
                  >
                    {url.replace("https://", "")}
                  </Text>
                </View>
              </View>
              <Text
                style={{
                  fontFamily: "JetBrainsMono_500Medium",
                  fontSize: 14,
                  color: T.red,
                }}
              >
                ↗
              </Text>
            </Pressable>
            {i === elsewhere.length - 1 ? null : <GCDots />}
            </View>
          ))}
        </View>
      </View>

      {/* Footer */}
      <View style={{ paddingHorizontal: 20, paddingTop: 32 }}>
        <GCDash />
        <View
          style={{
            marginTop: 10,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <GCTick>GC · COMMS MODULE</GCTick>
          <GCTick>UPTIME · 99.9%</GCTick>
        </View>
      </View>
    </ScrollView>
  );
}
