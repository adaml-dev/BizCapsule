"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type HtmlCode = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export default function HtmlEditorPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"list" | "editor" | "preview">("list");
  const [htmlCodes, setHtmlCodes] = useState<HtmlCode[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (activeTab === "list") {
      fetchHtmlCodes();
    }
  }, [activeTab]);

  const fetchHtmlCodes = async () => {
    try {
      const response = await fetch("/api/admin/html-codes");
      if (response.ok) {
        const data = await response.json();
        setHtmlCodes(data);
      } else if (response.status === 401) {
        router.push("/admin");
      }
    } catch (error) {
      console.error("Error fetching HTML codes:", error);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setMessage({ type: "error", text: "Title is required" });
      return;
    }

    if (!content.trim()) {
      setMessage({ type: "error", text: "Content is required" });
      return;
    }

    if (content.length > 100000) {
      setMessage({ type: "error", text: "Content exceeds 100,000 characters limit" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/html-codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "HTML code saved successfully!" });
        setTitle("");
        setContent("");
        setTimeout(() => {
          setActiveTab("list");
        }, 1500);
      } else {
        const data = await response.json();
        setMessage({ type: "error", text: data.error || "Failed to save HTML code" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save HTML code" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this HTML code?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/html-codes?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchHtmlCodes();
      } else {
        alert("Failed to delete HTML code");
      }
    } catch (error) {
      alert("Failed to delete HTML code");
    }
  };

  const handleLoadCode = (code: HtmlCode) => {
    setTitle(code.title);
    setContent(code.content);
    setActiveTab("editor");
  };

  const handleOpenInNewTab = () => {
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(content);
      newWindow.document.close();
    }
  };

  return (
    <main className="min-h-screen" style={{
      background: "radial-gradient(circle at top, #111827, #020617 45%, #020617)",
      color: "#e5e7eb",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', ui-sans-serif, sans-serif"
    }}>
      {/* Header */}
      <header style={{
        borderBottom: "1px solid rgba(30, 41, 59, 0.6)",
        background: "rgba(2, 6, 23, 0.6)",
        backdropFilter: "blur(24px)"
      }}>
        <div style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <h1 style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#e2e8f0"
          }}>
            BizCapsule{" "}
            <span style={{ color: "#64748b", fontWeight: 400 }}>· HTML Editor</span>
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <a
              href="/admin"
              style={{
                fontSize: "12px",
                padding: "6px 12px",
                borderRadius: "9999px",
                border: "1px solid #334155",
                background: "transparent",
                color: "#cbd5e1",
                textDecoration: "none",
                transition: "all 0.2s"
              }}
            >
              Back to Admin
            </a>
            <a
              href="/hub"
              style={{
                fontSize: "12px",
                padding: "6px 12px",
                borderRadius: "9999px",
                border: "1px solid #334155",
                background: "transparent",
                color: "#cbd5e1",
                textDecoration: "none",
                transition: "all 0.2s"
              }}
            >
              View Hub
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "40px 24px"
      }}>
        {/* Tabs */}
        <div style={{
          display: "flex",
          gap: "8px",
          marginBottom: "32px",
          borderBottom: "1px solid rgba(30, 41, 59, 0.6)",
          paddingBottom: "0"
        }}>
          {[
            { key: "list" as const, label: "📋 Saved Codes", icon: "📋" },
            { key: "editor" as const, label: "✏️ Editor", icon: "✏️" },
            { key: "preview" as const, label: "👁️ Preview", icon: "👁️" }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                fontSize: "13px",
                fontWeight: 500,
                padding: "12px 20px",
                border: "none",
                borderBottom: activeTab === tab.key ? "2px solid #6366f1" : "2px solid transparent",
                background: activeTab === tab.key ? "rgba(99, 102, 241, 0.14)" : "transparent",
                color: activeTab === tab.key ? "#818cf8" : "#94a3b8",
                cursor: "pointer",
                transition: "all 0.2s",
                borderTopLeftRadius: "8px",
                borderTopRightRadius: "8px"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{
          background: "radial-gradient(circle at top left, #111827, rgba(2, 6, 23, 0.9))",
          border: "1px solid rgba(30, 41, 59, 0.6)",
          borderRadius: "24px",
          padding: "32px",
          boxShadow: "0 24px 80px rgba(0, 0, 0, 0.7)"
        }}>
          {/* List Tab */}
          {activeTab === "list" && (
            <div>
              <h2 style={{
                fontSize: "20px",
                fontWeight: 600,
                marginBottom: "24px",
                color: "#e2e8f0"
              }}>
                Saved HTML Codes
              </h2>
              
              {htmlCodes.length === 0 ? (
                <div style={{
                  textAlign: "center",
                  padding: "48px 24px",
                  color: "#64748b"
                }}>
                  <p>No HTML codes saved yet. Create one in the Editor tab!</p>
                </div>
              ) : (
                <div style={{
                  display: "grid",
                  gap: "16px"
                }}>
                  {htmlCodes.map((code) => (
                    <div
                      key={code.id}
                      style={{
                        background: "rgba(15, 23, 42, 0.9)",
                        border: "1px solid rgba(55, 65, 81, 0.9)",
                        borderRadius: "16px",
                        padding: "20px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontSize: "16px",
                          fontWeight: 600,
                          color: "#e2e8f0",
                          marginBottom: "4px"
                        }}>
                          {code.title}
                        </h3>
                        <p style={{
                          fontSize: "12px",
                          color: "#64748b"
                        }}>
                          Created: {new Date(code.createdAt).toLocaleDateString()} · 
                          {code.content.length} characters
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => {
                            const newWindow = window.open();
                            if (newWindow) {
                              newWindow.document.write(code.content);
                              newWindow.document.close();
                            }
                          }}
                          style={{
                            fontSize: "12px",
                            padding: "8px 16px",
                            borderRadius: "8px",
                            border: "1px solid #10b981",
                            background: "rgba(16, 185, 129, 0.14)",
                            color: "#34d399",
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => handleLoadCode(code)}
                          style={{
                            fontSize: "12px",
                            padding: "8px 16px",
                            borderRadius: "8px",
                            border: "1px solid #6366f1",
                            background: "rgba(99, 102, 241, 0.14)",
                            color: "#818cf8",
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                        >
                          Load
                        </button>
                        <button
                          onClick={() => handleDelete(code.id)}
                          style={{
                            fontSize: "12px",
                            padding: "8px 16px",
                            borderRadius: "8px",
                            border: "1px solid #ef4444",
                            background: "rgba(239, 68, 68, 0.14)",
                            color: "#f87171",
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Editor Tab */}
          {activeTab === "editor" && (
            <div>
              <h2 style={{
                fontSize: "20px",
                fontWeight: 600,
                marginBottom: "24px",
                color: "#e2e8f0"
              }}>
                HTML Code Editor
              </h2>

              {message && (
                <div style={{
                  padding: "12px 16px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  background: message.type === "success" 
                    ? "rgba(74, 222, 128, 0.14)" 
                    : "rgba(239, 68, 68, 0.14)",
                  border: `1px solid ${message.type === "success" ? "#4ade80" : "#ef4444"}`,
                  color: message.type === "success" ? "#4ade80" : "#f87171",
                  fontSize: "13px"
                }}>
                  {message.text}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 500,
                    marginBottom: "8px",
                    color: "#cbd5e1"
                  }}>
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter HTML code title..."
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      fontSize: "14px",
                      background: "rgba(15, 23, 42, 0.9)",
                      border: "1px solid rgba(55, 65, 81, 0.9)",
                      borderRadius: "8px",
                      color: "#e2e8f0",
                      outline: "none"
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 500,
                    marginBottom: "8px",
                    color: "#cbd5e1"
                  }}>
                    HTML Content ({content.length} / 100,000 characters)
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste or write your HTML code here..."
                    style={{
                      width: "100%",
                      minHeight: "400px",
                      padding: "16px",
                      fontSize: "13px",
                      fontFamily: "'Courier New', monospace",
                      background: "rgba(15, 23, 42, 0.9)",
                      border: "1px solid rgba(55, 65, 81, 0.9)",
                      borderRadius: "8px",
                      color: "#e2e8f0",
                      outline: "none",
                      resize: "vertical"
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => {
                      setTitle("");
                      setContent("");
                      setMessage(null);
                    }}
                    style={{
                      fontSize: "13px",
                      padding: "10px 20px",
                      borderRadius: "8px",
                      border: "1px solid rgba(55, 65, 81, 0.9)",
                      background: "rgba(15, 23, 42, 0.9)",
                      color: "#cbd5e1",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    style={{
                      fontSize: "13px",
                      padding: "10px 20px",
                      borderRadius: "8px",
                      border: "1px solid #6366f1",
                      background: loading ? "rgba(99, 102, 241, 0.3)" : "rgba(99, 102, 241, 0.14)",
                      color: "#818cf8",
                      cursor: loading ? "not-allowed" : "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    {loading ? "Saving..." : "Save HTML Code"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === "preview" && (
            <div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px"
              }}>
                <h2 style={{
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "#e2e8f0",
                  margin: 0
                }}>
                  HTML Preview
                </h2>
                {content && (
                  <button
                    onClick={handleOpenInNewTab}
                    style={{
                      fontSize: "13px",
                      padding: "10px 20px",
                      borderRadius: "8px",
                      border: "1px solid #6366f1",
                      background: "rgba(99, 102, 241, 0.14)",
                      color: "#818cf8",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}
                  >
                    🔗 Open in New Tab
                  </button>
                )}
              </div>

              {!content ? (
                <div style={{
                  textAlign: "center",
                  padding: "48px 24px",
                  color: "#64748b"
                }}>
                  <p>No HTML content to preview. Go to the Editor tab and add some HTML code.</p>
                </div>
              ) : (
                <div style={{
                  background: "#ffffff",
                  border: "1px solid rgba(55, 65, 81, 0.9)",
                  borderRadius: "12px",
                  minHeight: "500px",
                  overflow: "auto"
                }}>
                  <iframe
                    srcDoc={content}
                    style={{
                      width: "100%",
                      minHeight: "500px",
                      border: "none",
                      borderRadius: "12px"
                    }}
                    sandbox="allow-scripts"
                    title="HTML Preview"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
