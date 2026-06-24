import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  GCBar,
  GCCard,
  GCChip,
  GCEye,
  GCHair,
  GCScreenHeader,
  GCTick,
  T,
} from "@/components/hud";
import { Rich } from "@/src/study/rich";
import {
  ALL_CARDS,
  cardIds,
  SUBJECTS,
  subjectById,
  subjectCategories,
} from "@/src/study/registry";
import {
  type DayLog,
  type Grade,
  dueCount,
  isDue,
  logToday,
  schedule,
  seenCount,
  type SrsMap,
  todayEpochDay,
} from "@/src/study/srs";
import { bumpStreak, currentStreak, type Streak } from "@/src/study/streak";
import { usePersistedState } from "@/src/study/store";

const GRADE_META: { value: Grade; label: string; color: string; hint: string }[] = [
  { value: "again", label: "Again", color: T.red, hint: "<1d" },
  { value: "hard", label: "Hard", color: T.amber, hint: "soon" },
  { value: "good", label: "Good", color: T.mint, hint: "ok" },
  { value: "easy", label: "Easy", color: T.cyan, hint: "later" },
];

// A study session is a queue of card ids plus its UI state. Collapsing it into one
// object lets us reset it during render (React's "adjust state on input change"
// pattern) when the subject/category changes — no effect, no cascading renders.
type Session = {
  key: string;
  queue: string[];
  revealed: boolean;
  // Distinct cards completed (graded hard/good/easy) this session. "Again"
  // recirculates the card and does NOT count, so the progress denominator
  // (queue.length + done) stays fixed at the session's distinct card count.
  done: number;
  mode: "due" | "ahead";
};

export default function StudyScreen() {
  const insets = useSafeAreaInsets();

  const [subjectId, setSubjectId, subjHydrated] = usePersistedState(
    "subject",
    SUBJECTS[0].id,
  );
  const [srs, setSrs, srsHydrated] = usePersistedState<SrsMap>("srs", {});
  const [streak, setStreak, streakHydrated] = usePersistedState<Streak | null>(
    "streak",
    null,
  );
  const [, setDayLog, daylogHydrated] = usePersistedState<DayLog>("daylog", {
    day: 0,
    ids: [],
  });

  const [category, setCategory] = useState("all");
  const [session, setSession] = useState<Session>({
    key: "",
    queue: [],
    revealed: false,
    done: 0,
    mode: "due",
  });

  const subject = subjectById(subjectId) ?? SUBJECTS[0];
  const categories = useMemo(() => subjectCategories(subject), [subject]);
  const cardMap = useMemo(
    () => new Map(subject.cards.map((c) => [c.id, c] as const)),
    [subject],
  );
  const poolIds = useMemo(() => cardIds(subject, category), [subject, category]);
  const subjectAll = useMemo(() => cardIds(subject, "all"), [subject]);
  const hydrated =
    srsHydrated && subjHydrated && streakHydrated && daylogHydrated;
  const today = todayEpochDay();

  // Start (or restart) the session when the subject/category changes. Runs during
  // render, guarded by the key so it fires once per change — reads `srs` as a
  // snapshot so grading mid-session doesn't reset the queue.
  const sessionKey = `${subjectId}|${category}`;
  if (srsHydrated && session.key !== sessionKey) {
    const due = poolIds.filter((id) => isDue(srs[id], today));
    setSession({ key: sessionKey, queue: due, revealed: false, done: 0, mode: "due" });
  }

  const currentId = session.queue[0];
  const card = currentId ? cardMap.get(currentId) : undefined;

  function grade(g: Grade) {
    const id = session.queue[0];
    if (!id) return;
    const t = todayEpochDay();
    setSrs((prev) => ({ ...prev, [id]: schedule(prev[id], g, t) }));
    setDayLog((prev) => logToday(prev, id, t));
    setStreak((prev) => bumpStreak(prev ?? undefined, t));
    const removing = g !== "again";
    setSession((prev) => ({
      ...prev,
      revealed: false,
      done: prev.done + (removing ? 1 : 0),
      // "Again" recirculates the card to the end of this session (no progress).
      queue: removing ? prev.queue.slice(1) : [...prev.queue.slice(1), id],
    }));
  }

  function studyAhead() {
    setSession((prev) => ({
      ...prev,
      queue: poolIds,
      revealed: false,
      done: 0,
      mode: "ahead",
    }));
  }

  const subjectDue = dueCount(subjectAll, srs, today);
  const subjectSeen = seenCount(subjectAll, srs);
  const streakDays = currentStreak(streak ?? undefined, today);

  const total = session.queue.length + session.done;
  const progressPct = total > 0 ? (session.done / total) * 100 : 0;

  return (
    <ScrollView
      testID="screen-study"
      style={{ flex: 1, backgroundColor: T.paper }}
      contentContainerStyle={{ paddingBottom: 140 }}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar style="dark" />
      <View style={{ paddingTop: insets.top + 4 }} />

      <GCScreenHeader
        eyebrow="§ STUDY DECK"
        title="Study."
        sub="Spaced-repetition flashcards for mobile-engineering interviews. Grade your recall — scheduling runs fully on-device."
        meta={`${ALL_CARDS.length} CARDS`}
      />

      {/* Subject picker */}
      <View style={{ paddingHorizontal: 20 }}>
        <GCEye tone="red">§ SUBJECT</GCEye>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, gap: 8 }}
      >
        {SUBJECTS.map((s) => {
          const due = dueCount(cardIds(s, "all"), srs, today);
          const selected = s.id === subject.id;
          return (
            <Pressable
              key={s.id}
              testID={`study-subject-${s.id}`}
              onPress={() => {
                setSubjectId(s.id);
                setCategory("all");
              }}
            >
              <View
                style={{
                  borderWidth: 1,
                  borderColor: selected ? T.ink : T.inkHair,
                  backgroundColor: selected ? T.ink : "transparent",
                  borderRadius: 14,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  minWidth: 124,
                }}
              >
                <Text
                  style={{
                    fontFamily: "DMSans_500Medium",
                    fontSize: 15,
                    letterSpacing: -0.2,
                    color: selected ? T.paper : T.ink,
                  }}
                >
                  {s.label}
                </Text>
                <Text
                  style={{
                    marginTop: 2,
                    fontFamily: "JetBrainsMono_500Medium",
                    fontSize: 9,
                    letterSpacing: 0.8,
                    textTransform: "uppercase",
                    color: selected ? T.onDarkMid : T.inkMid,
                  }}
                >
                  {!hydrated ? "—" : due > 0 ? `${due} due` : "caught up"}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Stats */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 20,
          paddingTop: 18,
          gap: 10,
        }}
      >
        <Stat
          label="STREAK"
          value={hydrated && streakDays > 0 ? `${streakDays}d` : "—"}
        />
        <Stat label="DUE" value={hydrated ? `${subjectDue}` : "—"} accent />
        <Stat
          label="KNOWN"
          value={hydrated ? `${subjectSeen}/${subjectAll.length}` : "—"}
        />
      </View>

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, gap: 8 }}
      >
        {categories.map((c) => (
          <Pressable
            key={c.value}
            testID={`study-cat-${c.value}`}
            onPress={() => setCategory(c.value)}
          >
            <GCChip variant={c.value === category ? "red" : "ghost"} size="xs">
              {c.label}
            </GCChip>
          </Pressable>
        ))}
      </ScrollView>

      {/* Deck */}
      <View style={{ paddingHorizontal: 20, paddingTop: 22 }}>
        {!hydrated ? (
          <View style={{ paddingVertical: 48, alignItems: "center" }}>
            <ActivityIndicator color={T.red} />
          </View>
        ) : card ? (
          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <GCTick>{`${session.done + 1} / ${total}`}</GCTick>
              <GCTick color={session.mode === "ahead" ? T.cyan : T.red}>
                {session.mode === "ahead" ? "STUDY AHEAD" : "DUE NOW"}
              </GCTick>
            </View>
            <GCBar value={progressPct} />

            <Pressable
              testID="flashcard"
              onPress={() =>
                !session.revealed && setSession((p) => ({ ...p, revealed: true }))
              }
              style={{ marginTop: 14 }}
            >
              <GCCard>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <GCChip variant="redSoft" size="xs">
                    {card.categoryLabel}
                  </GCChip>
                  {card.level ? (
                    <GCTick color={T.inkLow}>{card.level.toUpperCase()}</GCTick>
                  ) : null}
                </View>

                <Text
                  style={{
                    fontFamily: "DMSans_500Medium",
                    fontSize: 20,
                    lineHeight: 27,
                    letterSpacing: -0.4,
                    color: T.ink,
                  }}
                >
                  {card.question}
                </Text>

                {session.revealed ? (
                  <View style={{ marginTop: 16 }}>
                    <GCHair className="mb-4" />
                    <Rich answer={card.answer} />
                  </View>
                ) : (
                  <View style={{ marginTop: 20, alignItems: "center" }}>
                    <GCEye tone="mid" icon="hand-o-up">
                      TAP TO REVEAL
                    </GCEye>
                  </View>
                )}
              </GCCard>
            </Pressable>

            {session.revealed ? (
              <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
                {GRADE_META.map((g) => (
                  <Pressable
                    key={g.value}
                    testID={`grade-${g.value}`}
                    onPress={() => grade(g.value)}
                    style={{
                      flex: 1,
                      borderWidth: 1,
                      borderColor: g.color,
                      borderRadius: 12,
                      paddingVertical: 12,
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "DMSans_500Medium",
                        fontSize: 14,
                        color: g.color,
                      }}
                    >
                      {g.label}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "JetBrainsMono_400Regular",
                        fontSize: 8,
                        letterSpacing: 0.6,
                        textTransform: "uppercase",
                        color: g.color,
                        opacity: 0.7,
                      }}
                    >
                      {g.hint}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        ) : (
          <GCCard>
            <GCEye tone="red" icon="check">
              {session.done > 0 ? "SESSION COMPLETE" : "ALL CAUGHT UP"}
            </GCEye>
            <Text
              style={{
                marginTop: 12,
                fontFamily: "DMSans_500Medium",
                fontSize: 20,
                lineHeight: 27,
                letterSpacing: -0.4,
                color: T.ink,
              }}
            >
              {session.done > 0
                ? `You reviewed ${session.done} card${session.done === 1 ? "" : "s"} in ${subject.label}.`
                : `Nothing due in ${subject.label} right now.`}
            </Text>
            <Text
              style={{
                marginTop: 8,
                fontFamily: "DMSans_400Regular",
                fontSize: 13,
                lineHeight: 20,
                color: T.inkMid,
              }}
            >
              {streakDays > 0
                ? `Streak: ${streakDays} day${streakDays === 1 ? "" : "s"}. Come back tomorrow to keep it.`
                : "Grade a few cards to start a daily streak."}
            </Text>
            <Pressable
              testID="study-ahead"
              onPress={studyAhead}
              style={{
                marginTop: 18,
                alignSelf: "flex-start",
                backgroundColor: T.ink,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 11,
              }}
            >
              <Text
                style={{
                  fontFamily: "JetBrainsMono_500Medium",
                  fontSize: 11,
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                  color: T.paper,
                }}
              >
                {`Study ahead · ${poolIds.length}`}
              </Text>
            </Pressable>
          </GCCard>
        )}
      </View>
    </ScrollView>
  );
}

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <View
      style={{
        flex: 1,
        borderWidth: 1,
        borderColor: T.inkHair,
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 12,
      }}
    >
      <GCEye tone={accent ? "red" : "mid"}>{label}</GCEye>
      <Text
        style={{
          marginTop: 4,
          fontFamily: "DMSans_500Medium",
          fontSize: 22,
          letterSpacing: -0.6,
          color: accent ? T.red : T.ink,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
