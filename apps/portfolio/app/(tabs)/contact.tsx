import { View, Text, ScrollView, Pressable, Linking } from "react-native";
import { StatusBar } from "expo-status-bar";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { contactInfo, socialLinks } from "@/src/data/contact";
import { externalLinks } from "@/src/data/blog";

export default function ContactScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-honeydew"
      contentContainerClassName="pb-20"
      showsVerticalScrollIndicator={false}
    >
      <StatusBar style="dark" />

      {/* Header */}
      <View style={{ paddingTop: insets.top + 16 }} className="mb-6 px-6">
        <View className="mb-6 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2 rounded-full bg-imperial-red px-3 py-1.5">
            <View className="h-2 w-2 rounded-full bg-honeydew" />
            <Text className="font-display text-[10px] text-honeydew">
              OPEN TO CHAT
            </Text>
          </View>
          <Text className="font-display text-[11px] text-prussian-blue/50">
            24/7 INBOX
          </Text>
        </View>
        <Text className="font-display text-5xl leading-tight text-prussian-blue">
          Connect
        </Text>
        <Text className="mt-2 font-ui text-sm text-prussian-blue/60">
          Pick a channel. Email is the fastest path.
        </Text>
      </View>

      {/* Primary CTA */}
      <View className="mx-6 mb-5">
        <Pressable
          onPress={() => Linking.openURL("mailto:mail@gerardocordero.dev")}
          className="rounded-3xl bg-prussian-blue p-6"
        >
          <View className="mb-5 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2 rounded-full bg-imperial-red px-3 py-1.5">
              <FontAwesome name="envelope" size={10} color="#F1FAEE" />
              <Text className="font-display text-[10px] text-honeydew">
                PRIMARY LINE
              </Text>
            </View>
            <View className="h-9 w-9 items-center justify-center rounded-full bg-imperial-red">
              <FontAwesome name="arrow-right" size={14} color="#F1FAEE" />
            </View>
          </View>
          <Text className="font-display text-[28px] leading-tight text-honeydew">
            mail@
          </Text>
          <Text className="font-display text-[28px] leading-tight text-honeydew">
            gerardocordero.dev
          </Text>
          <View className="mt-4 flex-row items-center gap-2">
            <View className="h-1.5 w-1.5 rounded-full bg-imperial-red" />
            <Text className="font-ui text-xs text-powder-blue">
              Tap to compose · typically replies within a day
            </Text>
          </View>
        </Pressable>
      </View>

      {/* Direct Lines */}
      <View className="mb-6 px-6">
        <Text className="mb-3 font-display text-xs text-prussian-blue/60">
          DIRECT LINES
        </Text>
        <View className="gap-3">
          {contactInfo.map((item, i) => {
            const hasHref = !!item.href;
            const icons = ["phone", "envelope", "envelope", "language"];
            return (
              <Pressable
                key={`${item.label}-${item.value}`}
                onPress={() => item.href && Linking.openURL(item.href)}
                disabled={!hasHref}
                className={`flex-row items-center gap-4 rounded-2xl p-4 ${
                  hasHref
                    ? "border-2 border-prussian-blue"
                    : "bg-powder-blue/40"
                }`}
              >
                <View
                  className={`h-11 w-11 items-center justify-center rounded-xl ${
                    hasHref ? "bg-prussian-blue" : "bg-celadon-blue"
                  }`}
                >
                  <FontAwesome
                    name={icons[i] as any}
                    size={15}
                    color="#F1FAEE"
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-display text-[10px] text-prussian-blue/50">
                    {item.label.toUpperCase()}
                  </Text>
                  <Text className="mt-0.5 font-display text-base text-prussian-blue">
                    {item.value}
                  </Text>
                </View>
                {hasHref && (
                  <FontAwesome name="arrow-right" size={14} color="#E63946" />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Social */}
      <View className="mb-6 px-6">
        <Text className="mb-3 font-display text-xs text-prussian-blue/60">
          SOCIAL
        </Text>
        <View className="flex-row gap-3">
          {socialLinks.map((link) => (
            <Pressable
              key={link.platform}
              onPress={() => Linking.openURL(link.url)}
              className="flex-1 items-center justify-center rounded-2xl bg-celadon-blue p-5"
            >
              <FontAwesome
                name={link.icon as any}
                size={26}
                color="#F1FAEE"
              />
              <Text className="mt-3 font-display text-[11px] text-honeydew">
                {link.platform.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Elsewhere */}
      <View className="mb-4 px-6">
        <Text className="mb-3 font-display text-xs text-prussian-blue/60">
          ELSEWHERE ON THE WEB
        </Text>
        <View className="gap-3">
          {Object.entries(externalLinks).map(([label, url]) => (
            <Pressable
              key={label}
              onPress={() => Linking.openURL(url)}
              className="flex-row items-center gap-4 rounded-2xl border-2 border-prussian-blue p-4"
            >
              <View className="h-11 w-11 items-center justify-center rounded-xl bg-imperial-red">
                <FontAwesome name="globe" size={15} color="#F1FAEE" />
              </View>
              <View className="flex-1">
                <Text className="font-display text-base capitalize text-prussian-blue">
                  {label}
                </Text>
                <Text className="mt-0.5 font-ui text-[11px] text-prussian-blue/60">
                  {url.replace("https://", "")}
                </Text>
              </View>
              <FontAwesome name="external-link" size={14} color="#E63946" />
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
