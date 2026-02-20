import type { PostPreview, FullPost, Mood } from "@/types";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { Readable } from "stream";

// ─── Auth ────────────────────────────────────────────────────────────────────

function getAuth(): OAuth2Client {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Missing Google OAuth credentials");
  }

  const auth = new OAuth2Client(clientId, clientSecret);
  auth.setCredentials({ refresh_token: refreshToken });
  return auth;
}

async function getDrive() {
  const auth = getAuth();
  return google.drive({ version: "v3", auth });
}

async function getDocs() {
  const auth = getAuth();
  return google.docs({ version: "v1", auth });
}

// ─── Folder Setup ─────────────────────────────────────────────────────────────

export async function ensureRootFolders(): Promise<{
  publicPostsId: string;
  privateDraftsId: string;
  audioFilesId: string;
}> {
  const drive = await getDrive();
  const rootId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID!;

  async function findOrCreate(name: string, parentId: string): Promise<string> {
    const res = await drive.files.list({
      q: `name='${name}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: "files(id, name)",
    });

    if (res.data.files && res.data.files.length > 0) {
      return res.data.files[0].id!;
    }

    const created = await drive.files.create({
      requestBody: {
        name,
        mimeType: "application/vnd.google-apps.folder",
        parents: [parentId],
      },
      fields: "id",
    });

    return created.data.id!;
  }

  const [publicPostsId, privateDraftsId, audioFilesId] = await Promise.all([
    findOrCreate("public-posts", rootId),
    findOrCreate("private-drafts", rootId),
    findOrCreate("audio-files", rootId),
  ]);

  return { publicPostsId, privateDraftsId, audioFilesId };
}

export async function ensureUserFolder(
  userId: string,
  parentFolderId: string,
): Promise<string> {
  const drive = await getDrive();
  const folderName = `user-${userId}`;

  const res = await drive.files.list({
    q: `name='${folderName}' and '${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id)",
  });

  if (res.data.files && res.data.files.length > 0) {
    return res.data.files[0].id!;
  }

  const created = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentFolderId],
    },
    fields: "id",
  });

  return created.data.id!;
}

// ─── Post Creation ─────────────────────────────────────────────────────────────

export interface PostData {
  title: string;
  name: string;
  mood: "Rain" | "Static" | "Silence" | "Night";
  body: string;
  wordCount: number;
  readingTime: number;
  userId: string;
  isPrivate: boolean;
  audioFileId?: string;
  burnAfterDays?: number;
}

export async function createPost(data: PostData): Promise<string> {
  const drive = await getDrive();
  const docs = await getDocs();
  const { publicPostsId, privateDraftsId } = await ensureRootFolders();

  const parentFolder = data.isPrivate ? privateDraftsId : publicPostsId;
  const userFolder = await ensureUserFolder(data.userId, parentFolder);

  const timestamp = Date.now();
  const docTitle = data.title || `post-${timestamp}`;
  const createdDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const docRes = await drive.files.create({
    requestBody: {
      name: docTitle,
      mimeType: "application/vnd.google-apps.document",
      parents: [userFolder],
      properties: {
        userId: data.userId,
        mood: data.mood,
        isPrivate: String(data.isPrivate),
        wordCount: String(data.wordCount),
        readingTime: String(data.readingTime),
        audioFileId: data.audioFileId || "",
        burnAfter: data.burnAfterDays
          ? String(Date.now() + data.burnAfterDays * 86400000)
          : "",
        createdAt: String(timestamp),
        reactFelt: "0",
        reactAlone: "0",
        reactUnderstand: "0",
      },
    },
    fields: "id",
  });

  const docId = docRes.data.id!;

  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: {
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: [
              docTitle,
              "\n",
              `Name: ${data.name || "Anonymous"}`,
              "\n",
              `Mood: ${data.mood}`,
              "\n",
              `Created: ${createdDate}`,
              "\n",
              `Word Count: ${data.wordCount}`,
              "\n",
              `Reading Time: ${data.readingTime} min`,
              "\n\n",
              data.body,
              "\n\n",
              "─────────────────────",
              "\n",
              "Reactions",
              "\n",
              "I felt this: 0",
              "\n",
              "You're not alone: 0",
              "\n",
              "I understand: 0",
            ].join(""),
          },
        },
        {
          updateParagraphStyle: {
            range: { startIndex: 1, endIndex: docTitle.length + 1 },
            paragraphStyle: { namedStyleType: "HEADING_1" },
            fields: "namedStyleType",
          },
        },
      ],
    },
  });

  if (!data.isPrivate) {
    await drive.permissions.create({
      fileId: docId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });
  }

  return docId;
}

export async function getPublicPosts(options?: {
  limit?: number;
  mood?: string;
  orderBy?: "latest" | "oldest" | "random";
  audioOnly?: boolean;
}): Promise<PostPreview[]> {
  const drive = await getDrive();
  const { publicPostsId } = await ensureRootFolders();

  const res = await drive.files.list({
    q: `'${publicPostsId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id)",
  });

  const userFolders = res.data.files || [];
  const allPosts: PostPreview[] = [];

  for (const folder of userFolders) {
    const filesRes = await drive.files.list({
      q: `'${folder.id}' in parents and mimeType='application/vnd.google-apps.document' and trashed=false`,
      fields: "files(id, name, properties, createdTime)",
    });

    for (const file of filesRes.data.files || []) {
      const props = file.properties || {};

      if (options?.mood && props.mood !== options.mood) continue;
      if (options?.audioOnly && !props.audioFileId) continue;

      allPosts.push({
        id: file.id!,
        title: file.name!,
        name: props.name || "Anonymous",
        mood: (props.mood as Mood) ?? "Silence",
        preview: "",
        wordCount: parseInt(props.wordCount || "0"),
        readingTime: parseInt(props.readingTime || "1"),
        hasAudio: !!props.audioFileId,
        createdAt: parseInt(props.createdAt || "0"),
        reactFelt: parseInt(props.reactFelt || "0"),
        reactAlone: parseInt(props.reactAlone || "0"),
        reactUnderstand: parseInt(props.reactUnderstand || "0"),
      });
    }
  }

  if (options?.orderBy === "oldest") {
    allPosts.sort((a, b) => a.createdAt - b.createdAt);
  } else if (options?.orderBy === "random") {
    allPosts.sort(() => Math.random() - 0.5);
  } else {
    allPosts.sort((a, b) => b.createdAt - a.createdAt);
  }

  const limited = allPosts.slice(0, options?.limit || 50);

  for (const post of limited) {
    try {
      post.preview = await getPostPreview(post.id);
    } catch {
      post.preview = "";
    }
  }

  return limited;
}

export async function getPostPreview(fileId: string): Promise<string> {
  const docs = await getDocs();

  const doc = await docs.documents.get({ documentId: fileId });
  const content = doc.data.body?.content || [];

  let text = "";
  for (const element of content) {
    if (element.paragraph) {
      for (const elem of element.paragraph.elements || []) {
        text += elem.textRun?.content || "";
      }
    }
    if (text.length > 400) break;
  }

  const lines = text.split("\n").filter((l) => l.trim());
  const bodyStart = lines.findIndex(
    (l) =>
      !l.startsWith("Name:") &&
      !l.startsWith("Mood:") &&
      !l.startsWith("Created:") &&
      !l.startsWith("Word Count:") &&
      !l.startsWith("Reading Time:") &&
      l.length > 20,
  );

  if (bodyStart === -1) return lines.slice(1).join(" ").substring(0, 120);
  return lines.slice(bodyStart).join(" ").substring(0, 120);
}

export async function getPost(fileId: string): Promise<FullPost> {
  const drive = await getDrive();
  const docs = await getDocs();

  const [meta, doc] = await Promise.all([
    drive.files.get({
      fileId,
      fields: "id, name, properties, createdTime",
    }),
    docs.documents.get({ documentId: fileId }),
  ]);

  const props = meta.data.properties || {};
  const content = doc.data.body?.content || [];

  let fullText = "";
  for (const element of content) {
    if (element.paragraph) {
      for (const elem of element.paragraph.elements || []) {
        fullText += elem.textRun?.content || "";
      }
    }
  }

  const reactionsMarker = "─────────────────────";
  const bodyStart = fullText.indexOf("\n\n");
  const bodyEnd = fullText.indexOf(reactionsMarker);

  const body =
    bodyStart !== -1
      ? fullText
          .substring(bodyStart, bodyEnd !== -1 ? bodyEnd : undefined)
          .trim()
      : fullText;

  const createdAt = parseInt(props.createdAt || "0");

  return {
    id: fileId,
    title: meta.data.name!,
    name: props.name || "Anonymous",
    mood: (props.mood as Mood) ?? "Silence",
    body,
    wordCount: parseInt(props.wordCount || "0"),
    readingTime: parseInt(props.readingTime || "1"),
    hasAudio: !!props.audioFileId,
    audioFileId: props.audioFileId || "",
    createdAt,
    createdDate: new Date(createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    reactFelt: parseInt(props.reactFelt || "0"),
    reactAlone: parseInt(props.reactAlone || "0"),
    reactUnderstand: parseInt(props.reactUnderstand || "0"),
  };
}

// ─── Reactions ─────────────────────────────────────────────────────────────────

export type ReactionType = "felt" | "alone" | "understand";

export async function updateReaction(
  fileId: string,
  reaction: ReactionType,
): Promise<void> {
  const drive = await getDrive();

  const meta = await drive.files.get({
    fileId,
    fields: "properties",
  });

  const props = meta.data.properties || {};
  const key =
    reaction === "felt"
      ? "reactFelt"
      : reaction === "alone"
        ? "reactAlone"
        : "reactUnderstand";

  const current = parseInt(props[key] || "0");

  await drive.files.update({
    fileId,
    requestBody: {
      properties: {
        [key]: String(current + 1),
      },
    },
  });
}

// ─── Audio Upload ──────────────────────────────────────────────────────────────

export async function uploadAudio(
  audioBuffer: Buffer,
  mimeType: string,
  userId: string,
): Promise<string> {
  const drive = await getDrive();
  const { audioFilesId } = await ensureRootFolders();
  const stream = Readable.from(audioBuffer);
  const res = await drive.files.create({
    requestBody: {
      name: `audio-${userId}-${Date.now()}`,
      mimeType,
      parents: [audioFilesId],
    },

    media: {
      mimeType,
      body: stream,
    },
    fields: "id",
  });

  const audioId = res.data.id!;

  await drive.permissions.create({
    fileId: audioId,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
  });

  return audioId;
}

export function getAudioStreamUrl(fileId: string): string {
  return `/api/audio/${fileId}`;
}

// ─── Burn After Reading ────────────────────────────────────────────────────────

export async function deleteExpiredPosts(): Promise<number> {
  const drive = await getDrive();
  const { publicPostsId, privateDraftsId } = await ensureRootFolders();
  const now = Date.now();
  let deleted = 0;

  async function checkFolder(folderId: string) {
    const userFolders = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: "files(id)",
    });

    for (const folder of userFolders.data.files || []) {
      const files = await drive.files.list({
        q: `'${folder.id}' in parents and mimeType='application/vnd.google-apps.document' and trashed=false`,
        fields: "files(id, properties)",
      });

      for (const file of files.data.files || []) {
        const burnAfter = parseInt(file.properties?.burnAfter || "0");
        if (burnAfter > 0 && now > burnAfter) {
          await drive.files.delete({ fileId: file.id! });
          deleted++;
        }
      }
    }
  }

  await Promise.all([checkFolder(publicPostsId), checkFolder(privateDraftsId)]);

  return deleted;
}
