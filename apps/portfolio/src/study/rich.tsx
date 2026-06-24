// Tiny inline renderer for card answers. Card content uses a deliberately small,
// RN-renderable markup (no HTML): `inline code`, **bold**, blank-line paragraphs,
// and "- " bullet lines. This keeps content portable and editable as plain data
// while still reading like a real answer on device.
import { Text, View } from "react-native";
import { T } from "@/components/hud";

export type Seg = { text: string; code?: boolean; bold?: boolean };

// A line is a bullet only if "- " is followed by real content (captures the rest).
const BULLET = /^\s*-\s+(\S.*)$/;

// Split a line into inline segments. `code` and **bold** do not nest. Bold requires
// non-space adjacency to the delimiters so an exponent/`a ** b` reads as literal.
export function tokenize(input: string): Seg[] {
  const segs: Seg[] = [];
  const re = /(`[^`]+`|\*\*[^\s*](?:[^*]*[^\s*])?\*\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(input)) !== null) {
    if (m.index > last) segs.push({ text: input.slice(last, m.index) });
    const tok = m[0];
    if (tok.startsWith("`")) segs.push({ text: tok.slice(1, -1), code: true });
    else segs.push({ text: tok.slice(2, -2), bold: true });
    last = re.lastIndex;
  }
  if (last < input.length) segs.push({ text: input.slice(last) });
  return segs;
}

function Inline({
  text,
  color,
  size,
  codeBg,
}: {
  text: string;
  color: string;
  size: number;
  codeBg: string;
}) {
  return (
    <Text style={{ fontFamily: "DMSans_400Regular", fontSize: size, lineHeight: size * 1.5, color }}>
      {tokenize(text).map((s, i) =>
        s.code ? (
          <Text
            key={i}
            style={{
              fontFamily: "JetBrainsMono_400Regular",
              fontSize: size - 1.5,
              color: T.red,
              backgroundColor: codeBg,
            }}
          >
            {s.text}
          </Text>
        ) : s.bold ? (
          <Text key={i} style={{ fontFamily: "DMSans_500Medium", color }}>
            {s.text}
          </Text>
        ) : (
          <Text key={i}>{s.text}</Text>
        ),
      )}
    </Text>
  );
}

type Node = { type: "p" | "li"; text: string };

// Parse one block into ordered paragraph / bullet nodes. Lines are classified
// independently, so a lead-in line followed by bullets — or a stray non-bullet
// line inside a list — renders correctly instead of collapsing the whole block.
function parseBlock(block: string): Node[] {
  const nodes: Node[] = [];
  let para: string[] = [];
  const flush = () => {
    if (para.length) {
      nodes.push({ type: "p", text: para.join(" ") });
      para = [];
    }
  };
  for (const line of block.split("\n")) {
    const bullet = line.match(BULLET);
    if (bullet) {
      flush();
      nodes.push({ type: "li", text: bullet[1] });
    } else if (line.trim()) {
      para.push(line.trim());
    }
  }
  flush();
  return nodes;
}

/** Render lightweight card markup. Paragraphs split on blank lines; "- " → bullets. */
export function Rich({
  answer,
  onDark = false,
  size = 15,
}: {
  answer: string;
  onDark?: boolean;
  size?: number;
}) {
  const color = onDark ? T.paper : T.ink;
  const codeBg = onDark ? "rgba(246,244,237,0.10)" : T.redSoft;
  const blocks = answer.trim().split(/\n\s*\n/);

  return (
    <View style={{ gap: 12 }}>
      {blocks.map((block, bi) => (
        <View key={bi} style={{ gap: 8 }}>
          {parseBlock(block).map((n, i) =>
            n.type === "li" ? (
              <View key={i} style={{ flexDirection: "row", gap: 8 }}>
                <Text
                  style={{
                    fontFamily: "JetBrainsMono_500Medium",
                    fontSize: size - 2,
                    lineHeight: size * 1.5,
                    color: T.red,
                  }}
                >
                  ▸
                </Text>
                <View style={{ flex: 1 }}>
                  <Inline text={n.text} color={color} size={size} codeBg={codeBg} />
                </View>
              </View>
            ) : (
              <Inline key={i} text={n.text} color={color} size={size} codeBg={codeBg} />
            ),
          )}
        </View>
      ))}
    </View>
  );
}
