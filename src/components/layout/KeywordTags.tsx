"use client";

interface KeywordTagsProps {
  keywords: string[];
  maxDisplay?: number;
}

export function KeywordTags({ keywords, maxDisplay = 10 }: KeywordTagsProps) {
  const displayKeywords = keywords.slice(0, maxDisplay);

  if (displayKeywords.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {displayKeywords.map((keyword, index) => (
        <span
          key={index}
          className="keyword-tag"
          style={{
            animationDelay: `${index * 0.05}s`,
          }}
        >
          {keyword}
        </span>
      ))}
    </div>
  );
}

