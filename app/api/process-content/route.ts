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
  platforms: {
    twitter: {
      content: string
      hashtags: string[]
      character_count: number
    }
    linkedin: {
      content: string
      hashtags: string[]
      character_count: number
    }
    newsletter: {
      content: string
      subject_line: string
      word_count: number
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

    // Adapt content for each platform
    const twitterContent = adaptForPlatform(content, "twitter", target_audience, tone)
    const linkedinContent = adaptForPlatform(content, "linkedin", target_audience, tone)
    const newsletterContent = adaptForPlatform(content, "newsletter", target_audience, tone)

    // Generate subject line for newsletter
    const subjectLine = content.split(".")[0].substring(0, 50) + (content.length > 50 ? "..." : "")

    const result: ProcessedContent = {
      original_content: content,
      sentiment,
      platforms: {
        twitter: {
          content: twitterContent,
          hashtags: extractHashtags(content, "twitter"),
          character_count: twitterContent.length,
        },
        linkedin: {
          content: linkedinContent,
          hashtags: extractHashtags(content, "linkedin"),
          character_count: linkedinContent.length,
        },
        newsletter: {
          content: newsletterContent,
          subject_line: subjectLine,
          word_count: newsletterContent.split(/\s+/).length,
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
