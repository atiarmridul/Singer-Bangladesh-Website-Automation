import keywordData from "./search-keywords.json";

type SearchKeywordData = {
  keywords: string[];
};

const data = keywordData as SearchKeywordData;

// Validate test data at import time so search tests fail with a clear fixture error.
if (!Array.isArray(data.keywords) || data.keywords.length === 0) {
  throw new Error("tests-ts/data/search-keywords.json must provide at least one keyword");
}

export const searchKeywords = data.keywords;
