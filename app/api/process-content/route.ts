import { type NextRequest, NextResponse } from "next/server"

interface ContentRequest {
  content: string
  target_audience?: string
  tone?: string
}

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

// Simple sentiment analysis using keyword matching
function analyzeSentiment(text: string) {
  const positiveWords = [
    "good",
    "great",
    "excellent",
    "amazing",
    "wonderful",
    "fantastic",
    "love",
    "best",
    "awesome",
    "perfect",
    "happy",
    "excited",
    "thrilled",
    "delighted",
  ]
  const negativeWords = [
    "bad",
    "terrible",
    "awful",
    "horrible",
    "hate",
    "worst",
    "disappointed",
    "frustrated",
    "angry",
    "sad",
    "difficult",
    "problem",
    "issue",
    "failed",
  ]

  const words = text.toLowerCase().split(/\W+/)
  let positiveCount = 0
  let negativeCount = 0

  words.forEach((word) => {
    if (positiveWords.includes(word)) positiveCount++
    if (negativeWords.includes(word)) negativeCount++
  })

  const total = positiveCount + negativeCount
  if (total === 0) {
    return { label: "neutral", confidence: 0.5 }
  }

  if (positiveCount > negativeCount) {
    return { label: "positive", confidence: Math.min(0.95, 0.6 + (positiveCount / total) * 0.4) }
  } else if (negativeCount > positiveCount) {
    return { label: "negative", confidence: Math.min(0.95, 0.6 + (negativeCount / total) * 0.4) }
  } else {
    return { label: "neutral", confidence: 0.7 }
  }
}

// Extract hashtags from content
function extractHashtags(content: string, platform: string): string[] {
  const words = content
    .toLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 3)
  const commonHashtags = {
    twitter: ["#tech", "#innovation", "#business", "#startup", "#ai", "#productivity"],
    linkedin: ["#professional", "#business", "#leadership", "#growth", "#innovation", "#networking"],
    newsletter: [],
  }

  // Simple hashtag generation based on content keywords
  const hashtags = []
  if (words.includes("technology") || words.includes("tech")) hashtags.push("#technology")
  if (words.includes("business")) hashtags.push("#business")
  if (words.includes("innovation")) hashtags.push("#innovation")
  if (words.includes("ai") || words.includes("artificial")) hashtags.push("#ai")

  // Add platform-specific hashtags
  const platformTags = commonHashtags[platform as keyof typeof commonHashtags] || []
  hashtags.push(...platformTags.slice(0, 3 - hashtags.length))

  return hashtags.slice(0, 5)
}

// Calculate readability score (simplified Flesch Reading Ease)
function calculateReadability(text: string): number {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length
  const words = text.split(/\s+/).filter((w) => w.length > 0).length
  const syllables = text.split(/\s+/).reduce((count, word) => {
    return count + Math.max(1, word.toLowerCase().match(/[aeiouy]+/g)?.length || 1)
  }, 0)

  if (sentences === 0 || words === 0) return 50

  const avgSentenceLength = words / sentences
  const avgSyllablesPerWord = syllables / words

  const score = 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord
  return Math.max(0, Math.min(100, Math.round(score)))
}

// Adapt content for different platforms
function adaptForPlatform(content: string, platform: string, audience?: string, tone?: string) {
  const maxLengths = {
    twitter: 280,
    linkedin: 3000,
    newsletter: 5000,
  }

  let adaptedContent = content

  // Apply tone adjustments
  if (tone) {
    switch (tone.toLowerCase()) {
      case "professional":
        adaptedContent = adaptedContent.replace(/!/g, ".").replace(/\b(awesome|amazing|cool)\b/gi, "excellent")
        break
      case "casual":
        adaptedContent = adaptedContent.replace(/\b(excellent|outstanding)\b/gi, "awesome")
        break
      case "enthusiastic":
        if (!adaptedContent.includes("!")) {
          adaptedContent = adaptedContent.replace(/\.$/, "!")
        }
        break
    }
  }

  // Platform-specific adaptations
  switch (platform) {
    case "twitter":
      // Shorten for Twitter
      if (adaptedContent.length > 240) {
        adaptedContent = adaptedContent.substring(0, 240) + "..."
      }
      // Add call-to-action
      if (adaptedContent.length < 200) {
        adaptedContent += " What do you think?"
      }
      break

    case "linkedin":
      // Add professional context
      if (!adaptedContent.includes("professional") && !adaptedContent.includes("business")) {
        adaptedContent = "In today's business landscape, " + adaptedContent.toLowerCase()
      }
      // Add engagement question
      adaptedContent += "\n\nWhat has been your experience with this? Share your thoughts in the comments."
      break

    case "newsletter":
      // Add newsletter structure
      adaptedContent = `Dear Subscribers,\n\n${adaptedContent}\n\nThank you for reading, and we look forward to sharing more insights with you soon.\n\nBest regards,\nThe Team`
      break
  }

  return adaptedContent
}

function predictEngagement(content: string, platform: string, sentiment: any) {
  const contentLength = content.length
  const wordCount = content.split(/\s+/).length
  const hasHashtags = content.includes("#")
  const hasEmojis = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(
    content,
  )
  const hasQuestions = content.includes("?")
  const hasCallToAction = /\b(share|comment|like|follow|subscribe|click|learn more|read more)\b/i.test(content)

  // Base engagement score calculation
  let baseScore = 50

  // Sentiment impact
  if (sentiment.label === "positive") baseScore += 15
  else if (sentiment.label === "negative") baseScore += 5

  // Content features impact
  if (hasHashtags) baseScore += 10
  if (hasEmojis) baseScore += 8
  if (hasQuestions) baseScore += 12
  if (hasCallToAction) baseScore += 15

  // Platform-specific calculations
  switch (platform) {
    case "twitter":
      // Optimal length for Twitter is 71-100 characters
      if (contentLength >= 71 && contentLength <= 100) baseScore += 10
      else if (contentLength > 280) baseScore -= 20

      return {
        predicted_likes: Math.round(baseScore * 2.3 + Math.random() * 20),
        predicted_retweets: Math.round(baseScore * 0.8 + Math.random() * 10),
        predicted_replies: Math.round(baseScore * 0.5 + Math.random() * 8),
        engagement_score: Math.min(100, baseScore),
        optimal_posting_time: getOptimalPostingTime("twitter"),
      }

    case "linkedin":
      // LinkedIn prefers longer, professional content
      if (wordCount >= 50 && wordCount <= 200) baseScore += 15
      if (content.includes("professional") || content.includes("business")) baseScore += 10

      return {
        predicted_likes: Math.round(baseScore * 1.8 + Math.random() * 15),
        predicted_shares: Math.round(baseScore * 0.6 + Math.random() * 8),
        predicted_comments: Math.round(baseScore * 0.9 + Math.random() * 12),
        engagement_score: Math.min(100, baseScore),
        optimal_posting_time: getOptimalPostingTime("linkedin"),
      }

    case "newsletter":
      // Newsletter engagement based on subject line and content quality
      const subjectScore = content.split(".")[0].length <= 50 ? 10 : -5
      baseScore += subjectScore

      return {
        predicted_open_rate: Math.min(45, Math.max(15, baseScore * 0.6)),
        predicted_click_rate: Math.min(15, Math.max(2, baseScore * 0.2)),
        engagement_score: Math.min(100, baseScore),
        optimal_send_time: getOptimalPostingTime("newsletter"),
      }

    default:
      return {}
  }
}

function getOptimalPostingTime(platform: string): string {
  const now = new Date()
  const currentHour = now.getHours()

  switch (platform) {
    case "twitter":
      // Best times: 9 AM, 1-3 PM, 5 PM
      if (currentHour < 9) return "9:00 AM today"
      else if (currentHour < 13) return "1:00 PM today"
      else if (currentHour < 17) return "5:00 PM today"
      else return "9:00 AM tomorrow"

    case "linkedin":
      // Best times: 8-10 AM, 12 PM, 5-6 PM on weekdays
      if (currentHour < 8) return "8:00 AM today"
      else if (currentHour < 12) return "12:00 PM today"
      else if (currentHour < 17) return "5:00 PM today"
      else return "8:00 AM tomorrow"

    case "newsletter":
      // Best times: Tuesday-Thursday, 10 AM or 2 PM
      const dayOfWeek = now.getDay()
      if (dayOfWeek >= 2 && dayOfWeek <= 4) {
        if (currentHour < 10) return "10:00 AM today"
        else if (currentHour < 14) return "2:00 PM today"
        else return "10:00 AM tomorrow"
      } else {
        return "Tuesday 10:00 AM"
      }

    default:
      return "Optimal time not available"
  }
}

function generateOptimizedHashtags(content: string, platform: string): string[] {
  const words = content
    .toLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 3)
  const trendingHashtags = {
    twitter: ["#AI", "#Tech", "#Innovation", "#Startup", "#Growth", "#Digital", "#Future", "#Success"],
    linkedin: [
      "#Leadership",
      "#Professional",
      "#Business",
      "#Career",
      "#Networking",
      "#Industry",
      "#Strategy",
      "#Growth",
    ],
    newsletter: [],
  }

  const contentBasedTags = []

  // AI and technology related
  if (words.some((w) => ["ai", "artificial", "intelligence", "machine", "learning"].includes(w))) {
    contentBasedTags.push("#AI", "#MachineLearning", "#Technology")
  }

  // Business related
  if (words.some((w) => ["business", "startup", "entrepreneur", "company"].includes(w))) {
    contentBasedTags.push("#Business", "#Startup", "#Entrepreneur")
  }

  // Marketing related
  if (words.some((w) => ["marketing", "brand", "social", "content"].includes(w))) {
    contentBasedTags.push("#Marketing", "#Branding", "#ContentMarketing")
  }

  // Combine content-based and trending hashtags
  const platformTags = trendingHashtags[platform as keyof typeof trendingHashtags] || []
  const allTags = [...new Set([...contentBasedTags, ...platformTags])]

  return allTags.slice(0, 5)
}

function generateOptimizationSuggestions(content: string, sentiment: any, platforms: any) {
  const suggestions = {
    hashtag_recommendations: [],
    keyword_suggestions: [],
    tone_adjustments: [],
    timing_recommendations: [],
  }

  // Hashtag recommendations
  suggestions.hashtag_recommendations = [
    "Add trending hashtags for better discoverability",
    "Use platform-specific hashtags",
    "Include branded hashtags if applicable",
    "Mix popular and niche hashtags",
  ]

  // Keyword suggestions
  const hasKeywords = /\b(amazing|incredible|breakthrough|innovative|revolutionary)\b/i.test(content)
  if (!hasKeywords) {
    suggestions.keyword_suggestions.push('Add power words like "amazing", "breakthrough", or "innovative"')
  }

  if (!content.includes("?")) {
    suggestions.keyword_suggestions.push("Consider adding a question to increase engagement")
  }

  // Tone adjustments
  if (sentiment.label === "neutral") {
    suggestions.tone_adjustments.push("Consider adding more emotional language to increase engagement")
  }

  if (sentiment.confidence < 0.7) {
    suggestions.tone_adjustments.push("Clarify the tone to make the message more impactful")
  }

  // Timing recommendations
  suggestions.timing_recommendations = [
    "Post during peak hours for your audience",
    "Consider time zones of your target audience",
    "Use scheduling tools for optimal timing",
    "Test different posting times to find what works best",
  ]

  return suggestions
}

function optimizeContentForEngagement(content: string, platform: string, sentiment: any) {
  let optimizedContent = content

  // Add engagement-boosting elements
  if (!content.includes("?") && platform !== "newsletter") {
    // Add engaging questions
    const questions = ["What do you think?", "Have you experienced this?", "What's your take on this?", "Do you agree?"]
    optimizedContent += " " + questions[Math.floor(Math.random() * questions.length)]
  }

  // Platform-specific optimizations
  switch (platform) {
    case "twitter":
      // Add trending elements
      if (!optimizedContent.includes("#")) {
        optimizedContent += " #Innovation"
      }
      break

    case "linkedin":
      // Add professional call-to-action
      if (!optimizedContent.includes("share") && !optimizedContent.includes("comment")) {
        optimizedContent += "\n\nShare your thoughts in the comments below!"
      }
      break

    case "newsletter":
      // Optimize subject line
      const words = content.split(" ")
      if (words.length > 8) {
        return content.split(".")[0].substring(0, 47) + "..."
      }
      break
  }

  return optimizedContent
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body: ContentRequest = await request.json()

    if (!body.content || body.content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const { content, target_audience, tone } = body

    // Perform sentiment analysis
    const sentiment = analyzeSentiment(content)

    const twitterForecast = predictEngagement(content, "twitter", sentiment)
    const linkedinForecast = predictEngagement(content, "linkedin", sentiment)
    const newsletterForecast = predictEngagement(content, "newsletter", sentiment)

    // Adapt content for each platform
    const twitterContent = adaptForPlatform(content, "twitter", target_audience, tone)
    const linkedinContent = adaptForPlatform(content, "linkedin", target_audience, tone)
    const newsletterContent = adaptForPlatform(content, "newsletter", target_audience, tone)

    const optimizedTwitter = optimizeContentForEngagement(twitterContent, "twitter", sentiment)
    const optimizedLinkedIn = optimizeContentForEngagement(linkedinContent, "linkedin", sentiment)
    const optimizedNewsletterSubject = optimizeContentForEngagement(content, "newsletter", sentiment)

    const optimizationSuggestions = generateOptimizationSuggestions(content, sentiment, {
      twitter: twitterContent,
      linkedin: linkedinContent,
      newsletter: newsletterContent,
    })

    // Generate subject line for newsletter
    const subjectLine = content.split(".")[0].substring(0, 50) + (content.length > 50 ? "..." : "")

    const result: ProcessedContent = {
      original_content: content,
      sentiment,
      engagement_forecast: {
        twitter: twitterForecast,
        linkedin: linkedinForecast,
        newsletter: newsletterForecast,
      },
      optimization_suggestions: optimizationSuggestions,
      platforms: {
        twitter: {
          content: twitterContent,
          hashtags: generateOptimizedHashtags(content, "twitter"),
          character_count: twitterContent.length,
          optimized_content: optimizedTwitter,
        },
        linkedin: {
          content: linkedinContent,
          hashtags: generateOptimizedHashtags(content, "linkedin"),
          character_count: linkedinContent.length,
          optimized_content: optimizedLinkedIn,
        },
        newsletter: {
          content: newsletterContent,
          subject_line: subjectLine,
          word_count: newsletterContent.split(/\s+/).length,
          optimized_subject: optimizedNewsletterSubject,
        },
      },
      metadata: {
        processing_time: Date.now() - startTime,
        content_type: content.length > 500 ? "long-form" : "short-form",
        language: "en", // Simplified - would use language detection in real implementation
        readability_score: calculateReadability(content),
      },
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error processing content:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
