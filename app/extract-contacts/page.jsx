"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Globe,
  Mail,
  MessageSquare,
  ExternalLink,
  Copy,
  Check,
  ArrowRight,
  Shield,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@headlessui/react";

function Page() {
  const searchParams = useSearchParams();
  const website = searchParams.get("website");
  const emails = searchParams.get("emails");
  const contactform = searchParams.get("contactform");

  const [copiedEmail, setCopiedEmail] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Parse emails into a normalized array for rendering
  let emailList = [];
  try {
    if (emails) {
      const decoded = decodeURIComponent(emails);
      const parsed = JSON.parse(decoded);
      if (Array.isArray(parsed)) {
        emailList = parsed;
      } else if (parsed && typeof parsed === "object") {
        emailList = Object.values(parsed).filter(Boolean);
      } else if (typeof parsed === "string" && parsed !== "") {
        emailList = parsed;
      }
    }
  } catch (err) {
    if (emails) {
      emailList = [emails];
    }
  }

  useEffect(() => {
    console.log(emails);
  }, [emails]);

  const formatUrl = (url) => {
    if (!url) return "Not provided";
    try {
      const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
      return urlObj.hostname;
    } catch {
      return url;
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedEmail(text);
      setTimeout(() => setCopiedEmail(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const getStatusBadge = (hasContent) => {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
          hasContent
            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
        }`}
      >
        {hasContent ? (
          <>
            <Shield className="w-3 h-3" />
            Active
          </>
        ) : (
          <>
            <Sparkles className="w-3 h-3" />
            Pending
          </>
        )}
      </div>
    );
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary background gradients */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-violet-500/20 via-purple-500/15 to-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-blue-500/15 via-cyan-500/10 to-teal-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-gradient-to-r from-purple-500/10 to-pink-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {/* Header section */}
        <div className="container mx-auto px-4 pt-20 pb-12">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 rounded-3xl mb-8 shadow-2xl shadow-violet-500/25 relative">
              <Globe className="w-12 h-12 text-white" />
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-blue-600 rounded-3xl blur opacity-30 animate-pulse"></div>
            </div>

            <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-white via-violet-200 to-blue-200 bg-clip-text text-transparent mb-6 tracking-tight">
              Contact Hub
            </h1>

            <p className="text-xl md:text-2xl text-slate-400 leading-relaxed mb-4">
              Your complete contact ecosystem at a glance
            </p>

            <div className="flex items-center justify-center gap-3 text-sm text-slate-500">
              <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></div>
              <span>Real-time contact information</span>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-500"></div>
              <span>Secure & verified</span>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-1000"></div>
            </div>
          </div>
        </div>

        {/* Cards section */}
        <div className="container mx-auto px-4 pb-20">
          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Website Card */}
            <Card className="group bg-white/[0.02] backdrop-blur-xl border-white/10 hover:bg-white/[0.05] transition-all duration-700 hover:scale-[1.02] hover:shadow-2xl hover:shadow-violet-500/10 cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

              <CardHeader className="pb-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-violet-500 to-blue-500 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                      <Globe className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-2xl font-bold">
                        Website
                      </CardTitle>
                      <CardDescription className="text-slate-400 text-base">
                        Primary Domain
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(!!website)}
                </div>
              </CardHeader>

              <CardContent className="relative z-10">
                <div className="space-y-6">
                  <div
                    className="p-6 bg-white/5 rounded-2xl border border-white/10 group-hover:bg-white/10 transition-all duration-500"
                    onClick={() => website && window.open(website, "_blank")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-2xl font-bold text-white truncate mb-2">
                          {formatUrl(website)}
                        </p>
                        {website && (
                          <p className="text-slate-400 truncate text-sm">
                            {website}
                          </p>
                        )}
                      </div>
                      {website && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-3 text-violet-400 hover:text-violet-300 hover:bg-violet-500/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(website, "_blank");
                          }}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {website && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <ArrowRight className="w-4 h-4" />
                      <span>Click to visit website</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Email Card */}
            <Card className="group bg-white/[0.02] backdrop-blur-xl border-white/10 hover:bg-white/[0.05] transition-all duration-700 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

              <CardHeader className="pb-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                      <Mail className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-2xl font-bold">
                        Email System
                      </CardTitle>
                      <CardDescription className="text-slate-400 text-base">
                        {emailList.length > 0
                          ? `${emailList.length} Email${
                              emailList.length > 1 ? "s" : ""
                            }`
                          : "Contact Channels"}
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(emailList.length > 0)}
                </div>
              </CardHeader>

              <CardContent className="relative z-10">
                <div className="space-y-4">
                  {emailList.length > 0 ? (
                    emailList.map((email, index) => (
                      <div
                        key={index}
                        className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-500 group/email"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <a
                              href={`mailto:${email}`}
                              className="text-xl font-bold text-white hover:text-purple-300 transition-colors break-all block"
                            >
                              {email}
                            </a>
                            <p className="text-slate-500 text-sm mt-1">
                              Click to compose email
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-3 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20"
                            onClick={() => copyToClipboard(email)}
                          >
                            {copiedEmail === email ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 bg-white/5 rounded-2xl border border-white/10 text-center">
                      <p className="text-xl font-bold text-slate-400 mb-2">
                        No emails found
                      </p>
                      <p className="text-slate-500 text-sm">
                        Contact information not available
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Form Card */}
            <Card className="group bg-white/[0.02] backdrop-blur-xl border-white/10 hover:bg-white/[0.05] transition-all duration-700 hover:scale-[1.02] hover:shadow-2xl hover:shadow-orange-500/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

              <CardHeader className="pb-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                      <MessageSquare className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-2xl font-bold">
                        Contact Form
                      </CardTitle>
                      <CardDescription className="text-slate-400 text-base">
                        Form Integration
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(!!contactform)}
                </div>
              </CardHeader>

              <CardContent className="relative z-10">
                <div className="space-y-6">
                  <div
                    className="p-6 cursor-pointer bg-white/5 rounded-2xl border border-white/10 group-hover:bg-white/10 transition-all duration-500"
                    onClick={() =>
                      contactform && window.open(contactform, "_blank")
                    }
                  >
                    <div className="text-center">
                      {contactform ? (
                        <>
                          <p className="text-2xl font-bold text-white mb-3 break-all">
                            {contactform}
                          </p>
                          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                            <MessageSquare className="w-4 h-4" />
                            <span>Form system active</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="text-xl font-bold text-slate-400 mb-2">
                            No contact form
                          </p>
                          <p className="text-slate-500 text-sm">
                            Direct contact methods available above
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {contactform && (
                    <div className="flex items-center gap-2 text-sm text-slate-500 justify-center">
                      <ArrowRight className="w-4 h-4" />
                      <span>Integrated contact solution</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="container mx-auto px-4 pb-12">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 text-slate-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm">Contact information synchronized</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
