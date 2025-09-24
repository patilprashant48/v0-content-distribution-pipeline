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
  Download,
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
} from "lucide-react"

interface ProcessedContent {
  original_content: string
  sentiment: {
    label: string
    confidence: number
  }
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

    const dataStr = JSON.stringify(result, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = "content-pipeline-results.json"

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const shareToTwitter = (content: string, hashtags: string[]) => {
    const text = encodeURIComponent(`${content} ${hashtags.join(" ")}`)
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank")
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-6 pt-12 pb-8 max-w-6xl">
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            AI-Powered Content Distribution with Engagement Forecasting
          </div>
          <h1 className="text-6xl font-bold text-balance mb-6">
            <span className="gradient-text">Super fast content</span>
            <br />
            <span className="text-slate-900">with engagement prediction</span>
          </h1>
          <p className="text-xl text-slate-600 text-balance max-w-2xl mx-auto leading-relaxed">
            Transform your content for multiple platforms with intelligent adaptation, sentiment analysis, engagement
            forecasting, and automated optimization.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="card-hover animate-fade-in-up border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Content Input</CardTitle>
                  <CardDescription className="text-slate-500">
                    Enter your raw content and optional parameters
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="content" className="text-sm font-semibold text-slate-700">
                  Raw Content *
                </Label>
                <Textarea
                  id="content"
                  placeholder="Enter your content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-32 border-slate-200 focus:border-purple-300 focus:ring-purple-200 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="audience" className="text-sm font-semibold text-slate-700">
                    Target Audience
                  </Label>
                  <Input
                    id="audience"
                    placeholder="tech professionals..."
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="border-slate-200 focus:border-purple-300 focus:ring-purple-200"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="tone" className="text-sm font-semibold text-slate-700">
                    Desired Tone
                  </Label>
                  <Input
                    id="tone"
                    placeholder="professional, casual..."
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="border-slate-200 focus:border-purple-300 focus:ring-purple-200"
                  />
                </div>
              </div>

              <Button
                onClick={handleProcess}
                disabled={!content.trim() || isProcessing}
                className={`w-full h-12 text-base font-semibold transition-all duration-300 ${
                  isProcessing
                    ? "bg-slate-400"
                    : "gradient-bg hover:shadow-lg hover:shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing Content...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-5 w-5" />
                    Process Content
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="card-hover animate-slide-in-right border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Processing Results & Forecasting</CardTitle>
                  <CardDescription className="text-slate-500">
                    View your adapted content, analysis, and engagement predictions
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-6 animate-fade-in-up">
                  {/* Sentiment Analysis */}
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
                    <h3 className="font-semibold mb-3 text-slate-800">Sentiment Analysis</h3>
                    <div className="flex items-center gap-3">
                      <Badge
                        className={`px-3 py-1 font-medium ${
                          result.sentiment.label === "positive"
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : result.sentiment.label === "negative"
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                        }`}
                      >
                        {result.sentiment.label}
                      </Badge>
                      <span className="text-sm text-slate-600 font-medium">
                        {(result.sentiment.confidence * 100).toFixed(1)}% confidence
                      </span>
                    </div>
                  </div>

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

                  <Button
                    onClick={downloadResults}
                    variant="outline"
                    className="w-full h-11 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 bg-transparent"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Results (JSON)
                  </Button>
                </div>
              ) : (
                <div className="text-center text-slate-400 py-12 animate-fade-in-up">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-lg font-medium">Ready to forecast engagement</p>
                  <p className="text-sm mt-1">Enter your content and get AI-powered predictions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="mt-16 text-center animate-fade-in-up">
          <p className="text-slate-600 mb-8">
            Over 10,000 content creators use our pipeline to distribute content across platforms.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">3</div>
              <div className="text-sm text-slate-600">Platforms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">AI</div>
              <div className="text-sm text-slate-600">Powered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">Fast</div>
              <div className="text-sm text-slate-600">Processing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">Smart</div>
              <div className="text-sm text-slate-600">Analysis</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
