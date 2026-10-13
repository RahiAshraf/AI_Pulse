import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";

const configurationError = "Firebase Admin SDK is not configured on server";

export function getFirebaseAdminApp() {
  if (getApps().length > 0) return getApp();

  const configuredServiceAccount = process.env["FIREBASE_SERVICE_ACCOUNT_KEY"]?.trim();
  const projectId = process.env["FIREBASE_PROJECT_ID"];
  const clientEmailFallback = process.env["FIREBASE_CLIENT_EMAIL"];
  const privateKeyFallback = process.env["FIREBASE_PRIVATE_KEY"];
  if (!configuredServiceAccount && (!clientEmailFallback || !privateKeyFallback || !projectId)) {
    console.error("Firebase Admin configuration is missing the service account variable", {
      projectIdPresent: Boolean(projectId),
      clientEmailPresent: Boolean(clientEmailFallback),
      privateKeyPresent: Boolean(privateKeyFallback),
    });
    throw new Error(configurationError);
  }

  const serviceAccountJson = configuredServiceAccount
    ? configuredServiceAccount.startsWith("'") && configuredServiceAccount.endsWith("'")
      ? configuredServiceAccount.slice(1, -1)
      : configuredServiceAccount
    : "";

  let parsed: Record<string, unknown>;
  try {
    const decoded = JSON.parse(serviceAccountJson) as unknown;
    parsed = (typeof decoded === "string" ? JSON.parse(decoded) : decoded) as Record<
      string,
      unknown
    >;
  } catch {
    parsed = {};
  }

  if (!Object.keys(parsed).length) {
    console.error("Firebase Admin configuration contains invalid service account JSON", {
      serviceAccountLength: serviceAccountJson.length,
      projectIdPresent: Boolean(projectId),
      clientEmailPresent: Boolean(clientEmailFallback),
      privateKeyPresent: Boolean(privateKeyFallback),
    });
  }

  const hasServiceAccount =
    typeof parsed["client_email"] === "string" && typeof parsed["private_key"] === "string";
  const clientEmail = hasServiceAccount ? parsed["client_email"] : clientEmailFallback;
  const privateKey = hasServiceAccount
    ? parsed["private_key"]
    : privateKeyFallback?.replace(/\\n/g, "\n");
  const configuredProjectId =
    (typeof parsed["project_id"] === "string" ? parsed["project_id"] : undefined) || projectId;

  if (!clientEmail || !privateKey || !configuredProjectId) {
    console.error("Firebase Admin configuration is incomplete", {
      projectIdPresent: Boolean(configuredProjectId),
      clientEmailPresent: Boolean(clientEmail),
      privateKeyPresent: Boolean(privateKey),
    });
    throw new Error(configurationError);
  }

  try {
    return initializeApp({
      credential: cert(
        hasServiceAccount ? parsed : { projectId: configuredProjectId, clientEmail, privateKey },
      ),
      projectId: configuredProjectId,
    });
  } catch (error) {
    console.error("Firebase Admin initialization failed", {
      name: error instanceof Error ? error.name : "unknown",
      message: error instanceof Error ? error.message : "unknown error",
    });
    throw new Error(configurationError);
  }
}
