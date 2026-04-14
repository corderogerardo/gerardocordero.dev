import { View, Text, ScrollView, Pressable, Linking } from "react-native";
import { StatusBar } from "expo-status-bar";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { contactInfo, socialLinks } from "@/src/data/contact";
import { externalLinks } from "@/src/data/blog";

export default function ContactScreen() {
  return (
    <ScrollView
      className="flex-1 bg-honeydew"
      contentContainerClassName="pb-16"
    >
      <StatusBar style="dark" />

      {/* Top status strip */}
      <View className="flex-row items-center justify-between border-b-2 border-prussian-blue px-6 py-3">
        <Text className="font-major text-[10px] uppercase tracking-[2px] text-prussian-blue">
          §04 — dispatch
        </Text>
        <View className="flex-row items-center gap-2">
          <View className="h-2 w-2 rounded-full bg-imperial-red" />
          <Text className="font-major text-[10px] uppercase tracking-[2px] text-prussian-blue">
            channels open
          </Text>
        </View>
      </View>

      {/* Header */}
      <View className="px-6 pt-12 pb-10">
        <Text className="font-major text-[10px] uppercase tracking-[3px] text-imperial-red">
          ↳ send word
        </Text>
        <Text className="mt-3 font-major text-5xl leading-[0.88] text-prussian-blue">
          dispatch
        </Text>
        <View className="mt-5 border-l-2 border-imperial-red pl-5">
          <Text className="font-oxygen text-sm leading-6 text-prussian-blue/80">
            Channels for inquiries, collaborations, and conversation. Email is
            the most reliable.
          </Text>
        </View>
      </View>

      {/* Primary mailto block */}
      <View className="px-6 pb-10">
        <Pressable
          onPress={() => Linking.openURL("mailto:mail@gerardocordero.dev")}
          className="border-2 border-prussian-blue bg-prussian-blue p-6"
        >
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="font-major text-[10px] uppercase tracking-[3px] text-powder-blue/70">
              ↳ primary line
            </Text>
            <Text className="font-major text-[10px] uppercase tracking-[2px] text-imperial-red">
              ●
            </Text>
          </View>
          <Text className="font-major text-2xl leading-[1.1] text-honeydew">
            mail@
          </Text>
          <Text className="font-major text-2xl leading-[1.1] text-honeydew">
            gerardocordero
          </Text>
          <View className="flex-row items-baseline">
            <Text className="font-major text-2xl leading-[1.1] text-imperial-red">
              .dev
            </Text>
            <Text className="ml-2 font-major text-xl text-imperial-red">→</Text>
          </View>
        </Pressable>
      </View>

      {/* Direct lines */}
      <View className="border-t-2 border-prussian-blue px-6 py-8">
        <Text className="mb-5 font-major text-[10px] uppercase tracking-[3px] text-imperial-red">
          ↳ direct lines
        </Text>
        {contactInfo.map((item, i) => (
          <Pressable
            key={`${item.label}-${i}`}
            onPress={() => item.href && Linking.openURL(item.href)}
            className="flex-row items-center justify-between border-b border-prussian-blue/30 py-4"
          >
            <View className="flex-1 flex-row items-baseline gap-5">
              <Text className="font-major text-[10px] text-imperial-red">
                {String(i + 1).padStart(2, "0")}
              </Text>
              <View className="flex-1">
                <Text className="font-major text-[9px] uppercase tracking-[2px] text-celadon-blue">
                  {item.label}
                </Text>
                <Text className="mt-1 font-oxygen text-base text-prussian-blue">
                  {item.value}
                </Text>
              </View>
            </View>
            {item.href && (
              <Text className="font-major text-base text-prussian-blue">→</Text>
            )}
          </Pressable>
        ))}
      </View>

      {/* Channels */}
      <View className="border-t-2 border-prussian-blue px-6 py-8">
        <Text className="mb-5 font-major text-[10px] uppercase tracking-[3px] text-imperial-red">
          ↳ social channels
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {socialLinks.map((link) => (
            <Pressable
              key={link.platform}
              onPress={() => Linking.openURL(link.url)}
              className="flex-row items-center gap-3 border border-prussian-blue px-4 py-3"
            >
              <FontAwesome
                name={link.icon as any}
                size={14}
                color="#1D3557"
              />
              <Text className="font-major text-[11px] uppercase tracking-[2px] text-prussian-blue">
                {link.platform}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* External links */}
      <View className="border-t-2 border-prussian-blue px-6 py-8">
        <Text className="mb-5 font-major text-[10px] uppercase tracking-[3px] text-imperial-red">
          ↳ elsewhere
        </Text>
        {Object.entries(externalLinks).map(([label, url], i) => (
          <Pressable
            key={label}
            onPress={() => Linking.openURL(url)}
            className="flex-row items-center justify-between border-b border-prussian-blue/30 py-4"
          >
            <View className="flex-1 flex-row items-baseline gap-5">
              <Text className="font-major text-[10px] text-imperial-red">
                {String(i + 1).padStart(2, "0")}
              </Text>
              <View className="flex-1">
                <Text className="font-major text-[9px] uppercase tracking-[2px] text-celadon-blue">
                  {label}
                </Text>
                <Text className="mt-1 font-oxygen text-sm text-prussian-blue">
                  {url.replace("https://", "")}
                </Text>
              </View>
            </View>
            <Text className="font-major text-base text-prussian-blue">↗</Text>
          </Pressable>
        ))}
      </View>

      {/* Footer */}
      <View className="border-t-2 border-prussian-blue px-6 py-5">
        <View className="flex-row items-center justify-between">
          <Text className="font-major text-[9px] uppercase tracking-[2px] text-prussian-blue">
            end · dispatch ledger
          </Text>
          <Text className="font-major text-[9px] uppercase tracking-[2px] text-prussian-blue">
            §04
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
