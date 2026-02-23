export type Mood = "Rain" | "Static" | "Silence" | "Night";

export interface PostPreview {
  id: string;
  title: string;
  name: string;
  mood: Mood;
  preview: string;
  wordCount: number;
  readingTime: number;
  hasAudio: boolean;
  createdAt: number;
  reactFelt: number;
  reactAlone: number;
  reactUnderstand: number;
}

export interface FullPost {
  id: string;
  title: string;
  name: string;
  mood: Mood;
  body: string;
  wordCount: number;
  readingTime: number;
  hasAudio: boolean;
  audioFileId: string;
  createdAt: number;
  createdDate: string;
  reactFelt: number;
  reactAlone: number;
  reactUnderstand: number;
}

export interface SubmitPostPayload {
  title?: string;
  name?: string;
  body: string;
  mood: Mood;
  userId: string;
  isPrivate?: boolean;
  burnAfterDays?: number;
  audioFileId?: string;
}

export const MOOD_COLORS: Record<Mood, string> = {
  Rain: "text-rain",
  Static: "text-static",
  Silence: "text-silence",
  Night: "text-night",
};

export const MOOD_HEX_COLORS: Record<Mood, string> = {
  Rain: "#6b7f8f",
  Static: "#7a7a8a",
  Silence: "#8f8f7a",
  Night: "#4a5a6a",
};

export const MOOD_DESCRIPTIONS: Record<Mood, string> = {
  Rain: "something heavy",
  Static: "something unresolved",
  Silence: "something unspoken",
  Night: "something dark",
};
