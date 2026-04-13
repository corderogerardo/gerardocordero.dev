import { View, Text, ScrollView, Pressable, Linking } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { contactInfo, socialLinks } from "@/src/data/contact";
import { externalLinks } from "@/src/data/blog";

export default function ContactScreen() {
  return (
    <ScrollView className="flex-1 bg-prussian-blue">
      <View className="px-5 pb-8 pt-6">
        <Text className="mb-6 text-3xl font-bold text-honeydew">Contact</Text>

        <View className="mb-6 rounded-xl bg-honeydew p-5">
          {contactInfo.map((item, index) => (
            <Pressable
              key={`${item.label}-${index}`}
              className="mb-3 last:mb-0"
              onPress={() => item.href && Linking.openURL(item.href)}
            >
              <Text className="text-xs font-medium uppercase tracking-wider text-celadon-blue">
                {item.label}
              </Text>
              <Text
                className={`mt-1 text-base text-prussian-blue ${item.href ? "underline" : ""}`}
              >
                {item.value}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text className="mb-4 text-xl font-bold text-honeydew">Social</Text>
        <View className="flex-row gap-4">
          {socialLinks.map((link) => (
            <Pressable
              key={link.platform}
              className="items-center justify-center rounded-xl bg-honeydew p-4"
              onPress={() => Linking.openURL(link.url)}
            >
              <FontAwesome
                name={link.icon as any}
                size={28}
                color="#1D3557"
              />
              <Text className="mt-2 text-xs font-medium text-prussian-blue">
                {link.platform}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text className="mb-4 mt-8 text-xl font-bold text-honeydew">
          Links
        </Text>
        <View className="gap-3">
          {Object.entries(externalLinks).map(([label, url]) => (
            <Pressable
              key={label}
              className="rounded-xl bg-celadon-blue/20 p-4"
              onPress={() => Linking.openURL(url)}
            >
              <Text className="text-base font-medium capitalize text-powder-blue">
                {label}
              </Text>
              <Text className="mt-1 text-xs text-powder-blue/60">{url}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
