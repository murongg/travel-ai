export type Language = "zh" | "en" | "ja" | "ko" | "es" | "fr" | "de"

export interface Translation {
  [key: string]: string | Translation
}

export const translations: Record<Language, Translation> = {
  zh: {
    common: {
      loading: "加载中...",
      error: "出错了",
      retry: "重试",
      cancel: "取消",
      confirm: "确认",
      save: "保存",
      delete: "删除",
      edit: "编辑",
      share: "分享",
      download: "下载",
    },
    navigation: {
      home: "首页",
      templates: "攻略模板",
      community: "社区",
      tools: "实用工具",
      profile: "个人资料",
    },
    guide: {
      generate: "生成攻略",
      title: "旅游攻略",
      destination: "目的地",
      duration: "旅行天数",
      budget: "预算",
      travelers: "旅行人数",
    },
  },
  en: {
    common: {
      loading: "Loading...",
      error: "Something went wrong",
      retry: "Retry",
      cancel: "Cancel",
      confirm: "Confirm",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      share: "Share",
      download: "Download",
    },
    navigation: {
      home: "Home",
      templates: "Templates",
      community: "Community",
      tools: "Tools",
      profile: "Profile",
    },
    guide: {
      generate: "Generate Guide",
      title: "Travel Guide",
      destination: "Destination",
      duration: "Duration",
      budget: "Budget",
      travelers: "Travelers",
    },
  },
  ja: {
    common: {
      loading: "読み込み中...",
      error: "エラーが発生しました",
      retry: "再試行",
      cancel: "キャンセル",
      confirm: "確認",
      save: "保存",
      delete: "削除",
      edit: "編集",
      share: "共有",
      download: "ダウンロード",
    },
    navigation: {
      home: "ホーム",
      templates: "テンプレート",
      community: "コミュニティ",
      tools: "ツール",
      profile: "プロフィール",
    },
    guide: {
      generate: "ガイド生成",
      title: "旅行ガイド",
      destination: "目的地",
      duration: "期間",
      budget: "予算",
      travelers: "旅行者数",
    },
  },
  ko: {
    common: {
      loading: "로딩 중...",
      error: "오류가 발생했습니다",
      retry: "다시 시도",
      cancel: "취소",
      confirm: "확인",
      save: "저장",
      delete: "삭제",
      edit: "편집",
      share: "공유",
      download: "다운로드",
    },
    navigation: {
      home: "홈",
      templates: "템플릿",
      community: "커뮤니티",
      tools: "도구",
      profile: "프로필",
    },
    guide: {
      generate: "가이드 생성",
      title: "여행 가이드",
      destination: "목적지",
      duration: "기간",
      budget: "예산",
      travelers: "여행자 수",
    },
  },
  es: {
    common: {
      loading: "Cargando...",
      error: "Algo salió mal",
      retry: "Reintentar",
      cancel: "Cancelar",
      confirm: "Confirmar",
      save: "Guardar",
      delete: "Eliminar",
      edit: "Editar",
      share: "Compartir",
      download: "Descargar",
    },
    navigation: {
      home: "Inicio",
      templates: "Plantillas",
      community: "Comunidad",
      tools: "Herramientas",
      profile: "Perfil",
    },
    guide: {
      generate: "Generar Guía",
      title: "Guía de Viaje",
      destination: "Destino",
      duration: "Duración",
      budget: "Presupuesto",
      travelers: "Viajeros",
    },
  },
  fr: {
    common: {
      loading: "Chargement...",
      error: "Une erreur s'est produite",
      retry: "Réessayer",
      cancel: "Annuler",
      confirm: "Confirmer",
      save: "Sauvegarder",
      delete: "Supprimer",
      edit: "Modifier",
      share: "Partager",
      download: "Télécharger",
    },
    navigation: {
      home: "Accueil",
      templates: "Modèles",
      community: "Communauté",
      tools: "Outils",
      profile: "Profil",
    },
    guide: {
      generate: "Générer le Guide",
      title: "Guide de Voyage",
      destination: "Destination",
      duration: "Durée",
      budget: "Budget",
      travelers: "Voyageurs",
    },
  },
  de: {
    common: {
      loading: "Laden...",
      error: "Etwas ist schief gelaufen",
      retry: "Wiederholen",
      cancel: "Abbrechen",
      confirm: "Bestätigen",
      save: "Speichern",
      delete: "Löschen",
      edit: "Bearbeiten",
      share: "Teilen",
      download: "Herunterladen",
    },
    navigation: {
      home: "Startseite",
      templates: "Vorlagen",
      community: "Community",
      tools: "Werkzeuge",
      profile: "Profil",
    },
    guide: {
      generate: "Reiseführer erstellen",
      title: "Reiseführer",
      destination: "Reiseziel",
      duration: "Dauer",
      budget: "Budget",
      travelers: "Reisende",
    },
  },
}

export const i18nService = {
  currentLanguage: "zh" as Language,

  setLanguage: async (language: Language): Promise<void> => {
    try {
      const response = await fetch("/api/enhanced/translation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ language }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.translations) {
          // Update translations with server-provided data
          Object.assign(translations[language], data.translations)
        }
      }
    } catch (error) {
      console.warn("Failed to sync language preference with server:", error)
    }

    i18nService.currentLanguage = language
    localStorage.setItem("preferred-language", language)
    document.documentElement.lang = language
  },

  getLanguage: async (): Promise<Language> => {
    try {
      const response = await fetch("/api/enhanced/languages", {
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.preferredLanguage) {
          localStorage.setItem("preferred-language", data.preferredLanguage)
          return data.preferredLanguage
        }
      }
    } catch (error) {
      console.warn("Failed to get language preference from server:", error)
    }

    // Fallback to localStorage
    const saved = localStorage.getItem("preferred-language") as Language
    return saved || "zh"
  },

  t: (key: string): string => {
    const keys = key.split(".")
    let value: any = translations[i18nService.currentLanguage]

    for (const k of keys) {
      value = value?.[k]
    }

    return typeof value === "string" ? value : key
  },

  getSupportedLanguages: () => [
    { code: "zh", name: "中文", flag: "🇨🇳" },
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
    { code: "ko", name: "한국어", flag: "🇰🇷" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
  ],

  translateText: async (text: string, targetLanguage: Language): Promise<string> => {
    try {
      const response = await fetch("/api/enhanced/translation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ text, targetLanguage }),
      })

      if (!response.ok) {
        throw new Error("Translation failed")
      }

      const data = await response.json()
      return data.translatedText
    } catch (error) {
      console.error("Error translating text:", error)
      return text // Return original text as fallback
    }
  },
}

// Helper function to get auth headers
function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}
