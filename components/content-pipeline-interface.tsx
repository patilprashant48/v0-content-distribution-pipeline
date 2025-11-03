"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  Sparkles,
  Zap,
  Target,
  Twitter,
  Linkedin,
  Mail,
  Copy,
  TrendingUp,
  Clock,
  Lightbulb,
  BarChart3,
  Rocket,
  Brain,
  Globe,
  Star,
  FileText,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ProcessedContent {
  original_content: string
  engagement_forecast: {
    twitter: {
      predicted_likes: number
      predicted_retweets: number
      predicted_replies: number
      engagement_score: number
      optimal_posting_time: string
    }
    linkedin: {
      predicted_likes: number
      predicted_shares: number
      predicted_comments: number
      engagement_score: number
      optimal_posting_time: string
    }
    newsletter: {
      predicted_open_rate: number
      predicted_click_rate: number
      engagement_score: number
      optimal_send_time: string
    }
  }
  optimization_suggestions: {
    hashtag_recommendations: string[]
    keyword_suggestions: string[]
    tone_adjustments: string[]
    timing_recommendations: string[]
  }
  platforms: {
    twitter: {
      content: string
      hashtags: string[]
      character_count: number
      optimized_content?: string
    }
    linkedin: {
      content: string
      hashtags: string[]
      character_count: number
      optimized_content?: string
    }
    newsletter: {
      content: string
      subject_line: string
      word_count: number
      optimized_subject?: string
    }
  }
  metadata: {
    processing_time: number
    content_type: string
    language: string
    readability_score: number
  }
}

const TARGET_AUDIENCE_OPTIONS = [
  "Tech professionals",
  "Entrepreneurs",
  "Business leaders",
  "Marketing professionals",
  "Content creators",
  "Investors",
  "Students",
  "General audience",
  "Other",
]

export function ContentPipelineInterface() {
  const [content, setContent] = useState("")
  const [targetAudience, setTargetAudience] = useState("")
  const [tone, setTone] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<ProcessedContent | null>(null)
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null)
  const [showOptimized, setShowOptimized] = useState<{ [key: string]: boolean }>({})

  const handleProcess = async () => {
    if (!content.trim()) return

    setIsProcessing(true)
    try {
      const response = await fetch("/api/process-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          target_audience: targetAudience,
          tone,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to process content")
      }

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Error processing content:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadResults = () => {
    if (!result) return

    // Create PDF content structure
    const pdfContent = `
CONTENT DISTRIBUTION PIPELINE - ANALYSIS REPORT
================================================

ORIGINAL CONTENT
${result.original_content}

ENGAGEMENT FORECASTING
======================
TWITTER
-------
Predicted Likes: ${result.engagement_forecast.twitter.predicted_likes}
Predicted Retweets: ${result.engagement_forecast.twitter.predicted_retweets}
Predicted Replies: ${result.engagement_forecast.twitter.predicted_replies}
Engagement Score: ${result.engagement_forecast.twitter.engagement_score}/100
Optimal Posting Time: ${result.engagement_forecast.twitter.optimal_posting_time}

LINKEDIN
--------
Predicted Likes: ${result.engagement_forecast.linkedin.predicted_likes}
Predicted Shares: ${result.engagement_forecast.linkedin.predicted_shares}
Predicted Comments: ${result.engagement_forecast.linkedin.predicted_comments}
Engagement Score: ${result.engagement_forecast.linkedin.engagement_score}/100
Optimal Posting Time: ${result.engagement_forecast.linkedin.optimal_posting_time}

NEWSLETTER
----------
Predicted Open Rate: ${result.engagement_forecast.newsletter.predicted_open_rate.toFixed(1)}%
Predicted Click Rate: ${result.engagement_forecast.newsletter.predicted_click_rate.toFixed(1)}%
Engagement Score: ${result.engagement_forecast.newsletter.engagement_score}/100
Optimal Send Time: ${result.engagement_forecast.newsletter.optimal_send_time}

OPTIMIZATION SUGGESTIONS
========================
Hashtag Recommendations:
${result.optimization_suggestions.hashtag_recommendations.map((s) => `- ${s}`).join("\n")}

Keyword Suggestions:
${result.optimization_suggestions.keyword_suggestions.map((s) => `- ${s}`).join("\n")}

Tone Adjustments:
${result.optimization_suggestions.tone_adjustments.map((s) => `- ${s}`).join("\n")}

Timing Recommendations:
${result.optimization_suggestions.timing_recommendations.map((s) => `- ${s}`).join("\n")}

PLATFORM-ADAPTED CONTENT
=========================
TWITTER
-------
Content: ${result.platforms.twitter.content}
Hashtags: ${result.platforms.twitter.hashtags.join(" ")}
Character Count: ${result.platforms.twitter.character_count}

LINKEDIN
--------
Content: ${result.platforms.linkedin.content}
Hashtags: ${result.platforms.linkedin.hashtags.join(" ")}
Character Count: ${result.platforms.linkedin.character_count}

NEWSLETTER
----------
Subject Line: ${result.platforms.newsletter.subject_line}
Content: ${result.platforms.newsletter.content}
Word Count: ${result.platforms.newsletter.word_count}

METADATA
========
Processing Time: ${result.metadata.processing_time}ms
Content Type: ${result.metadata.content_type}
Language: ${result.metadata.language}
Readability Score: ${result.metadata.readability_score}/100
    `

    // Create blob and download
    const blob = new Blob([pdfContent], { type: "text/plain;charset=utf-8" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "content-pipeline-analysis.txt")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const shareToTwitter = (content: string, hashtags: string[]) => {
    try {
      const fullText = `${content} ${hashtags.join(" ")}`
      const encodedText = encodeURIComponent(fullText)
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}`

      // Open with proper window parameters to ensure Twitter login page appears
      const width = 550
      const height = 420
      const left = window.screenX + (window.outerWidth - width) / 2
      const top = window.screenY + (window.outerHeight - height) / 2

      window.open(
        twitterUrl,
        "twitter-share",
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`,
      )
    } catch (error) {
      console.error("Error opening Twitter share:", error)
    }
  }

  const shareToLinkedIn = (content: string) => {
    const text = encodeURIComponent(content)
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${text}`,
      "_blank",
    )
  }

  const copyToClipboard = async (content: string, platform: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedPlatform(platform)
      setTimeout(() => setCopiedPlatform(null), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const openEmailClient = (subject: string, content: string) => {
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(content)}`
    window.location.href = mailtoLink
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <div className="container mx-auto px-6 pt-16 pb-12 max-w-7xl relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 px-6 py-3 rounded-full text-sm font-semibold mb-8 border border-purple-200 shadow-lg">
            <Sparkles className="h-5 w-5" />
            AI-Powered Content Distribution with Engagement Forecasting
            <Star className="h-4 w-4 text-yellow-500" />
          </div>

          <h1 className="text-7xl md:text-8xl font-black text-balance mb-8 leading-tight">
            <span className="gradient-text">Transform content</span>
            <br />
            <span className="text-slate-900">across platforms</span>
          </h1>

          <p className="text-2xl text-slate-600 text-balance max-w-3xl mx-auto leading-relaxed mb-12">
            Intelligent content adaptation and engagement forecasting powered by advanced AI.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-100 shadow-sm">
              <Brain className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-slate-700">AI-Powered</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-100 shadow-sm">
              <Globe className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-slate-700">Multi-Platform</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-green-100 shadow-sm">
              <Rocket className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-slate-700">Lightning Fast</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          <Card className="card-hover animate-fade-in-up border-0 shadow-2xl bg-white/90 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5"></div>
            <CardHeader className="pb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-900">Content Input</CardTitle>
                  <CardDescription className="text-slate-600 text-base">
                    Enter your content and watch AI work its magic
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 relative z-10">
              <div className="space-y-4">
                <Label htmlFor="content" className="text-base font-bold text-slate-800">
                  Raw Content *
                </Label>
                <Textarea
                  id="content"
                  placeholder="Share your thoughts, ideas, or announcements here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-40 border-2 border-slate-200 focus:border-purple-400 focus:ring-purple-200 resize-none text-base rounded-xl shadow-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label htmlFor="audience" className="text-base font-bold text-slate-800">
                    Target Audience
                  </Label>
                  <Select value={targetAudience} onValueChange={setTargetAudience}>
                    <SelectTrigger
                      id="audience"
                      className="border-2 border-slate-200 focus:border-purple-400 focus:ring-purple-200 h-12 text-base rounded-xl shadow-sm"
                    >
                      <SelectValue placeholder="Select target audience..." />
                    </SelectTrigger>
                    <SelectContent className="border-slate-200">
                      {TARGET_AUDIENCE_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="tone" className="text-base font-bold text-slate-800">
                    Desired Tone
                  </Label>
                  <Input
                    id="tone"
                    placeholder="professional, casual, friendly..."
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="border-2 border-slate-200 focus:border-purple-400 focus:ring-purple-200 h-12 text-base rounded-xl shadow-sm"
                  />
                </div>
              </div>

              <Button
                onClick={handleProcess}
                disabled={!content.trim() || isProcessing}
                className={`w-full h-14 text-lg font-bold transition-all duration-300 rounded-xl shadow-lg ${
                  isProcessing
                    ? "bg-slate-400"
                    : "gradient-bg hover:shadow-xl hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98] glow-purple"
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                    Processing Content...
                  </>
                ) : (
                  <>
                    <Zap className="mr-3 h-6 w-6" />
                    Transform Content
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="card-hover animate-slide-in-right border-0 shadow-2xl bg-white/90 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
            <CardHeader className="pb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-900">AI Analysis & Predictions</CardTitle>
                  <CardDescription className="text-slate-600 text-base">
                    Real-time insights and engagement forecasting
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              {result ? (
                <div className="space-y-8 animate-scale-in">
                  {/* Engagement Forecasting */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                    <h3 className="font-semibold mb-4 text-slate-800 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      Engagement Forecasting
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Twitter Forecast */}
                      <div className="bg-white p-3 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Twitter className="h-4 w-4 text-blue-500" />
                          <span className="font-medium text-sm">Twitter</span>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Likes:</span>
                            <span className="font-medium">{result.engagement_forecast.twitter.predicted_likes}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Retweets:</span>
                            <span className="font-medium">{result.engagement_forecast.twitter.predicted_retweets}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Score:</span>
                            <Badge
                              className={`text-xs ${result.engagement_forecast.twitter.engagement_score >= 70 ? "bg-green-100 text-green-700" : result.engagement_forecast.twitter.engagement_score >= 50 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}
                            >
                              {result.engagement_forecast.twitter.engagement_score}/100
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 mt-2 text-slate-600">
                            <Clock className="h-3 w-3" />
                            <span className="text-xs">{result.engagement_forecast.twitter.optimal_posting_time}</span>
                          </div>
                        </div>
                      </div>

                      {/* LinkedIn Forecast */}
                      <div className="bg-white p-3 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Linkedin className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-sm">LinkedIn</span>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Likes:</span>
                            <span className="font-medium">{result.engagement_forecast.linkedin.predicted_likes}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Shares:</span>
                            <span className="font-medium">{result.engagement_forecast.linkedin.predicted_shares}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Score:</span>
                            <Badge
                              className={`text-xs ${result.engagement_forecast.linkedin.engagement_score >= 70 ? "bg-green-100 text-green-700" : result.engagement_forecast.linkedin.engagement_score >= 50 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}
                            >
                              {result.engagement_forecast.linkedin.engagement_score}/100
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 mt-2 text-slate-600">
                            <Clock className="h-3 w-3" />
                            <span className="text-xs">{result.engagement_forecast.linkedin.optimal_posting_time}</span>
                          </div>
                        </div>
                      </div>

                      {/* Newsletter Forecast */}
                      <div className="bg-white p-3 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Mail className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-sm">Newsletter</span>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Open Rate:</span>
                            <span className="font-medium">
                              {result.engagement_forecast.newsletter.predicted_open_rate.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Click Rate:</span>
                            <span className="font-medium">
                              {result.engagement_forecast.newsletter.predicted_click_rate.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Score:</span>
                            <Badge
                              className={`text-xs ${result.engagement_forecast.newsletter.engagement_score >= 70 ? "bg-green-100 text-green-700" : result.engagement_forecast.newsletter.engagement_score >= 50 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}
                            >
                              {result.engagement_forecast.newsletter.engagement_score}/100
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 mt-2 text-slate-600">
                            <Clock className="h-3 w-3" />
                            <span className="text-xs">{result.engagement_forecast.newsletter.optimal_send_time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Optimization Suggestions */}
                  <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-100">
                    <h3 className="font-semibold mb-4 text-slate-800 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-600" />
                      Optimization Suggestions
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-sm mb-2 text-slate-700">Hashtag Recommendations</h4>
                        <ul className="text-xs text-slate-600 space-y-1">
                          {result.optimization_suggestions.hashtag_recommendations.slice(0, 2).map((suggestion, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-yellow-500 mt-0.5">•</span>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-2 text-slate-700">Content Improvements</h4>
                        <ul className="text-xs text-slate-600 space-y-1">
                          {result.optimization_suggestions.keyword_suggestions.slice(0, 2).map((suggestion, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-yellow-500 mt-0.5">•</span>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Platform Content */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-800">Platform-Adapted Content</h3>

                    {/* Twitter */}
                    <div className="p-4 border border-slate-200 rounded-xl bg-white hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                          <Twitter className="h-4 w-4 text-blue-500" />
                          Twitter
                          <Badge
                            className={`ml-2 text-xs ${result.engagement_forecast.twitter.engagement_score >= 70 ? "bg-green-100 text-green-700" : result.engagement_forecast.twitter.engagement_score >= 50 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}
                          >
                            {result.engagement_forecast.twitter.engagement_score}/100
                          </Badge>
                        </h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {
                              (showOptimized.twitter
                                ? result.platforms.twitter.optimized_content
                                : result.platforms.twitter.content
                              )?.length
                            }{" "}
                            chars
                          </Badge>
                          {result.platforms.twitter.optimized_content && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowOptimized((prev) => ({ ...prev, twitter: !prev.twitter }))}
                              className="text-xs"
                            >
                              {showOptimized.twitter ? "Original" : "Optimized"}
                            </Button>
                          )}
                        </div>
                      </div>

                      <p className="text-sm mb-3 text-slate-700 leading-relaxed">
                        {showOptimized.twitter
                          ? result.platforms.twitter.optimized_content
                          : result.platforms.twitter.content}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {result.platforms.twitter.hashtags.map((tag, i) => (
                          <Badge key={i} className="bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            shareToTwitter(result.platforms.twitter.content, result.platforms.twitter.hashtags)
                          }
                          className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
                        >
                          <Twitter className="h-3 w-3" />
                          Share
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            copyToClipboard(
                              `${result.platforms.twitter.content} ${result.platforms.twitter.hashtags.join(" ")}`,
                              "twitter",
                            )
                          }
                          className="flex items-center gap-2"
                        >
                          <Copy className="h-3 w-3" />
                          {copiedPlatform === "twitter" ? "Copied!" : "Copy"}
                        </Button>
                      </div>
                    </div>

                    {/* LinkedIn */}
                    <div className="p-4 border border-slate-200 rounded-xl bg-white hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                          <Linkedin className="h-4 w-4 text-blue-600" />
                          LinkedIn
                          <Badge
                            className={`ml-2 text-xs ${result.engagement_forecast.linkedin.engagement_score >= 70 ? "bg-green-100 text-green-700" : result.engagement_forecast.linkedin.engagement_score >= 50 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}
                          >
                            {result.engagement_forecast.linkedin.engagement_score}/100
                          </Badge>
                        </h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {
                              (showOptimized.linkedin
                                ? result.platforms.linkedin.optimized_content
                                : result.platforms.linkedin.content
                              )?.length
                            }{" "}
                            chars
                          </Badge>
                          {result.platforms.linkedin.optimized_content && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowOptimized((prev) => ({ ...prev, linkedin: !prev.linkedin }))}
                              className="text-xs"
                            >
                              {showOptimized.linkedin ? "Original" : "Optimized"}
                            </Button>
                          )}
                        </div>
                      </div>

                      <p className="text-sm mb-3 text-slate-700 leading-relaxed">
                        {showOptimized.linkedin
                          ? result.platforms.linkedin.optimized_content
                          : result.platforms.linkedin.content}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {result.platforms.linkedin.hashtags.map((tag, i) => (
                          <Badge key={i} className="bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => shareToLinkedIn(result.platforms.linkedin.content)}
                          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                        >
                          <Linkedin className="h-3 w-3" />
                          Share
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            copyToClipboard(
                              `${result.platforms.linkedin.content} ${result.platforms.linkedin.hashtags.join(" ")}`,
                              "linkedin",
                            )
                          }
                          className="flex items-center gap-2"
                        >
                          <Copy className="h-3 w-3" />
                          {copiedPlatform === "linkedin" ? "Copied!" : "Copy"}
                        </Button>
                      </div>
                    </div>

                    {/* Newsletter */}
                    <div className="p-4 border border-slate-200 rounded-xl bg-white hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                          <Mail className="h-4 w-4 text-green-600" />
                          Newsletter
                          <Badge
                            className={`ml-2 text-xs ${result.engagement_forecast.newsletter.engagement_score >= 70 ? "bg-green-100 text-green-700" : result.engagement_forecast.newsletter.engagement_score >= 50 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}
                          >
                            {result.engagement_forecast.newsletter.engagement_score}/100
                          </Badge>
                        </h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {result.platforms.newsletter.word_count} words
                          </Badge>
                          {result.platforms.newsletter.optimized_subject && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowOptimized((prev) => ({ ...prev, newsletter: !prev.newsletter }))}
                              className="text-xs"
                            >
                              {showOptimized.newsletter ? "Original" : "Optimized"}
                            </Button>
                          )}
                        </div>
                      </div>

                      <p className="text-sm font-semibold mb-2 text-slate-800">
                        Subject:{" "}
                        {showOptimized.newsletter
                          ? result.platforms.newsletter.optimized_subject
                          : result.platforms.newsletter.subject_line}
                      </p>
                      <p className="text-sm text-slate-700 leading-relaxed mb-4">
                        {result.platforms.newsletter.content}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            openEmailClient(
                              result.platforms.newsletter.subject_line,
                              result.platforms.newsletter.content,
                            )
                          }
                          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                        >
                          <Mail className="h-3 w-3" />
                          Open Email
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            copyToClipboard(
                              `Subject: ${result.platforms.newsletter.subject_line}\n\n${result.platforms.newsletter.content}`,
                              "newsletter",
                            )
                          }
                          className="flex items-center gap-2"
                        >
                          <Copy className="h-3 w-3" />
                          {copiedPlatform === "newsletter" ? "Copied!" : "Copy"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h3 className="font-semibold mb-3 text-slate-800">Processing Metadata</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Processing Time:</span>
                        <span className="font-medium text-slate-800">{result.metadata.processing_time}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Content Type:</span>
                        <span className="font-medium text-slate-800">{result.metadata.content_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Language:</span>
                        <span className="font-medium text-slate-800">{result.metadata.language}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Readability:</span>
                        <span className="font-medium text-slate-800">{result.metadata.readability_score}/100</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={downloadResults}
                      variant="outline"
                      className="flex-1 h-12 border-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 bg-transparent font-bold text-base rounded-xl"
                    >
                      <FileText className="mr-3 h-5 w-5" />
                      Download as Report
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-400 py-16 animate-fade-in-up">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="h-10 w-10 text-purple-500" />
                  </div>
                  <p className="text-2xl font-bold text-slate-600 mb-2">Ready to Transform</p>
                  <p className="text-base text-slate-500">
                    Enter your content to see AI-powered insights and predictions
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-24 text-center animate-fade-in-up">
          <p className="text-xl text-slate-600 mb-12 font-medium">
            Trusted by over <span className="font-bold text-purple-600">10,000+</span> content creators worldwide
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100 card-hover">
              <div className="text-4xl font-black text-purple-600 mb-2">3</div>
              <div className="text-base font-semibold text-slate-600">Platforms</div>
            </div>
            <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 card-hover">
              <div className="text-4xl font-black text-blue-600 mb-2">AI</div>
              <div className="text-base font-semibold text-slate-600">Powered</div>
            </div>
            <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-green-100 card-hover">
              <div className="text-4xl font-black text-green-600 mb-2">Fast</div>
              <div className="text-base font-semibold text-slate-600">Processing</div>
            </div>
            <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-100 card-hover">
              <div className="text-4xl font-black text-indigo-600 mb-2">Smart</div>
              <div className="text-base font-semibold text-slate-600">Analysis</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
