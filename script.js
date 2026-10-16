import { pipeline, env } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1";

// The model files are downloaded from Hugging Face on first use and cached by the browser.
// Inference runs on-device; no chat-completion API or user account is used.
env.allowLocalModels = false;
env.useBrowserCache = true;

const MODEL_ID = "onnx-community/Qwen2.5-0.5B-Instruct";
const $ = (id) => document.getElementById(id);
const loadBtn = $("loadBtn");
const sendBtn = $("sendBtn");
const input = $("promptInput");
const messages = $("messages");
const welcome = $("welcome");
const statusText = $("statusText");
const statusDot = $("statusDot");
const composerStatus = $("composerStatus");
let generator = null;
let loading = false;
let generating = false;
let history = [];
let maxTokens = 256;
let temperature = 0.7;

function setStatus(text, state = "") {
  statusText.textContent = text;
  statusDot.className = "status-dot" + (state ? ` ${state}` : "");
  composerStatus.textContent = text;
}
function addMessage(role, text, typing = false) {
  welcome.classList.add("hidden");
  const wrap = document.createElement("div");
  wrap.className = `message ${role}`;
  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "user" ? "أنت" : "N";
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;
  if (typing) bubble.classList.add("typing");
  wrap.append(avatar, bubble);
  messages.appendChild(wrap);
  $("chatArea").scrollTop = $("chatArea").scrollHeight;
  return { wrap, bubble };
}
async function loadModel() {
  if (loading || generator) return;
  loading = true;
  loadBtn.disabled = true;
  loadBtn.textContent = "جارٍ التحميل…";
  $("loadTitle").textContent = "يتم تحميل ملفات النموذج";
  $("loadSub").textContent = "اترك الصفحة مفتوحة. قد يكون التنزيل الأول كبيرًا.";
  setStatus("تحميل النموذج…", "busy");
  try {
    // Prefer WebGPU; fall back to WASM if the browser/device cannot initialize WebGPU.
    try {
      generator = await pipeline("text-generation", MODEL_ID, {
        device: "webgpu",
        dtype: "q4",
        progress_callback: (info) => showProgress(info)
      });
    } catch (gpuError) {
      console.warn("WebGPU unavailable; trying WASM.", gpuError);
      generator = await pipeline("text-generation", MODEL_ID, {
        device: "wasm",
        dtype: "q4",
        progress_callback: (info) => showProgress(info)
      });
    }
    loadBtn.textContent = "تم التحميل";
    loadBtn.disabled = true;
    $("loadTitle").textContent = "النموذج جاهز";
    $("loadSub").textContent = "يمكنك الآن بدء المحادثة على جهازك.";
    setStatus("النموذج جاهز", "ready");
    sendBtn.disabled = false;
    input.focus();
  } catch (err) {
    console.error(err);
    generator = null;
    loadBtn.disabled = false;
    loadBtn.textContent = "إعادة المحاولة";
    $("loadTitle").textContent = "تعذر تحميل النموذج";
    $("loadSub").textContent = "تحقق من الإنترنت أثناء التنزيل، أو جرّب متصفحًا يدعم WebGPU.";
    setStatus("فشل التحميل");
  } finally {
    loading = false;
  }
}
function showProgress(info) {
  if (!info || typeof info !== "object") return;
  if (info.status === "progress" && Number.isFinite(info.progress)) {
    const pct = Math.max(0, Math.min(100, Math.round(info.progress)));
    $("loadTitle").textContent = `تحميل ملفات النموذج ${pct}%`;
  } else if (info.status === "downloading") {
    $("loadTitle").textContent = "تنزيل ملفات النموذج…";
  } else if (info.status === "ready") {
    $("loadTitle").textContent = "تهيئة النموذج…";
  }
}
function makeMessages(userText) {
  const recent = history.slice(-8);
  return [
    {
      role: "system",
      content: "You are NEXUS, a helpful assistant. Respond in the language used by the user. Be clear and practical. For code requests, provide runnable code and explain important caveats. Do not claim you performed actions you did not perform."
    },
    ...recent,
    { role: "user", content: userText }
  ];
}
async function sendMessage() {
  const text = input.value.trim();
  if (!text || !generator || generating) return;
  input.value = "";
  input.style.height = "auto";
  addMessage("user", text);
  history.push({ role: "user", content: text });
  generating = true;
  sendBtn.disabled = true;
  input.disabled = true;
  setStatus("النموذج يكتب…", "busy");
  const assistant = addMessage("assistant", "جارٍ توليد الإجابة…", true);
  try {
    const result = await generator(makeMessages(text), {
      max_new_tokens: maxTokens,
      do_sample: temperature > 0.05,
      temperature: temperature,
      return_full_text: false
    });
    const generated = result?.[0]?.generated_text;
    let answer = "";
    if (typeof generated === "string") {
      answer = generated.trim();
    } else if (Array.isArray(generated)) {
      const lastAssistant = [...generated].reverse().find(item =>
        item && item.role === "assistant" && typeof item.content === "string"
      );
      if (lastAssistant) answer = lastAssistant.content.trim();
      else {
        const lastItem = generated[generated.length - 1];
        if (lastItem && typeof lastItem.content === "string") answer = lastItem.content.trim();
      }
    }
    if (!answer) answer = "لم يُنتج النموذج نصًا هذه المرة. جرّب صياغة أخرى.";
    assistant.bubble.classList.remove("typing");
    assistant.bubble.textContent = answer;
    history.push({ role: "assistant", content: answer });
  } catch (err) {
    console.error(err);
    assistant.bubble.classList.remove("typing");
    assistant.bubble.textContent = "حدث خطأ أثناء التوليد. قد تكون ذاكرة الجهاز غير كافية؛ جرّب إعادة تحميل الصفحة أو تقليل طول الإجابة.";
    history.pop();
  } finally {
    generating = false;
    input.disabled = false;
    sendBtn.disabled = !generator;
    setStatus("النموذج جاهز", "ready");
    input.focus();
    $("chatArea").scrollTop = $("chatArea").scrollHeight;
  }
}
loadBtn.addEventListener("click", loadModel);
sendBtn.addEventListener("click", sendMessage);
input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 180)}px`;
});
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});
$("newChatBtn").addEventListener("click", () => {
  history = [];
  messages.replaceChildren();
  welcome.classList.remove("hidden");
  input.value = "";
  input.focus();
});
$("settingsBtn").addEventListener("click", () => $("settingsModal").classList.remove("hidden"));
$("closeSettings").addEventListener("click", () => $("settingsModal").classList.add("hidden"));
$("settingsModal").addEventListener("click", (event) => {
  if (event.target === $("settingsModal")) $("settingsModal").classList.add("hidden");
});
$("maxTokens").addEventListener("input", (event) => {
  maxTokens = Number(event.target.value);
  $("tokenValue").textContent = String(maxTokens);
});
$("temperature").addEventListener("input", (event) => {
  temperature = Number(event.target.value);
  $("tempValue").textContent = temperature.toFixed(1);
});
$("clearBtn").addEventListener("click", () => {
  history = [];
  messages.replaceChildren();
  welcome.classList.remove("hidden");
  $("settingsModal").classList.add("hidden");
});
