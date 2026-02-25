// recom.js

// To strip common suffixes --> allows "swimming" to match "swim", "hiked" to match "hike", etc
function getRootWord(word) {
    const w = word.toLowerCase();
    if (w.length <= 3) return w; // prevent potential short words like "bus"

    // Check suffixes
    if (w.endsWith("ing")) return w.slice(0, -3);
    if (w.endsWith("ies")) return w.slice(0, -3) + "y"; // parties -> party
    if (w.endsWith("es")) return w.slice(0, -2);
    if (w.endsWith("ed")) return w.slice(0, -2);
    if (w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1); // hikes -> hike

    return w;
}

// JS version (mimicking Sklearn's TfidfVectorizer)
class TfidfEngine {
    constructor() {
        this.vocabulary = {}; // term -> index
        this.idf = [];        // index -> idf value
        
        this.tokenizer = (text) => {
            return text.toLowerCase()
                .split(/[\s,]+/)
                .filter(t => t.length > 0)
                .map(t => getRootWord(t));
        };
    }

    fit(documents) {
        const docCount = documents.length;
        const termDocCounts = {};

        documents.forEach(doc => {
            const uniqueTerms = new Set(this.tokenizer(doc));
            uniqueTerms.forEach(term => {
                this.vocabulary[term] = (this.vocabulary[term] || Object.keys(this.vocabulary).length);
                termDocCounts[term] = (termDocCounts[term] || 0) + 1;
            });
        });

        const sortedTerms = Object.keys(this.vocabulary).sort();
        sortedTerms.forEach((term, index) => {
            this.vocabulary[term] = index;
        });

        this.idf = sortedTerms.map(term => {
            const df = termDocCounts[term] || 0;
            return Math.log((docCount + 1) / (df + 1)) + 1;
        });
    }

    transform(rawDocuments) {
        const vectors = [];
        const vocabSize = Object.keys(this.vocabulary).length;

        rawDocuments.forEach(doc => {
            const terms = this.tokenizer(doc);
            const tf = {};
            
            terms.forEach(term => {
                if (this.vocabulary.hasOwnProperty(term)) {
                    tf[term] = (tf[term] || 0) + 1;
                }
            });

            const vector = new Array(vocabSize).fill(0);
            let sumSquares = 0;

            for (const [term, count] of Object.entries(tf)) {
                const idx = this.vocabulary[term];
                const val = count * this.idf[idx];
                vector[idx] = val;
                sumSquares += val * val;
            }

            const norm = Math.sqrt(sumSquares);
            if (norm > 0) {
                for (let i = 0; i < vocabSize; i++) {
                    vector[i] /= norm;
                }
            }
            vectors.push(vector);
        });

        return vectors;
    }
}

function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
    }
    return dotProduct;
}

// === Main Recommendation Function ===
export function getFilteredRecommendations(userPreferences, allActivities) {
    const POOL_SIZE = 109; // total activity count
    const MIN_KEYWORD_MATCHES = 1;

    console.log(`[*] Finding recommendations for: '${userPreferences.join(", ")}'`);

    // Preprocessing Data & Query
    const docsKeywords = allActivities.map(a => (a.Keywords || "").toString());
    const queryKeywords = userPreferences.map(kw => kw.trim().toLowerCase()).filter(Boolean);
    const processedQuery = queryKeywords.join(" ");

    // Count truly relevant activities
    let totalRelevantCount = 0;
    docsKeywords.forEach(kws => {
        const lowerKws = kws.toLowerCase();
        const isRelevant = queryKeywords.some(q => {
            const rootQ = getRootWord(q);
            return lowerKws.includes(q) || lowerKws.includes(rootQ);
        });
        if (isRelevant) totalRelevantCount++;
    });

    // TF-IDF Vectorization
    const engine = new TfidfEngine();
    engine.fit(docsKeywords);
    
    const tfidfMatrix = engine.transform(docsKeywords);
    const queryVector = engine.transform([processedQuery])[0];

    // Cosine Similarity
    const similarities = tfidfMatrix.map(docVec => cosineSimilarity(queryVector, docVec));

    // Sorting
    const indices = similarities.map((_, i) => i);
    indices.sort((a, b) => similarities[b] - similarities[a]);
    const topIndices = indices.slice(0, POOL_SIZE);

    if (topIndices.length > 0 && similarities[topIndices[0]] === 0.0) {
        // Getting a 0.0 for a "match" is unlikely. But if it happens, it means the match was found in a substring ("raft" inside "craft")
    }

    const finalResults = [];

    for (const i of topIndices) {
        const activity = allActivities[i];
        const activityKeywordsStr = (activity.Keywords || "").toString();
        
        const activityPhrases = activityKeywordsStr.split(',').map(p => p.trim());
        
        const matchedKeywords = []; 
        const dataMatch = [];    

        for (const kw of queryKeywords) {
            const rootKw = getRootWord(kw);

            const matchingPhrases = activityPhrases.filter(phrase => {
                const pLower = phrase.toLowerCase();
                // To check if phrase contains the keyword OR the root word
                return pLower.includes(kw) || pLower.includes(rootKw);
            });
            
            if (matchingPhrases.length > 0) {
                if (!matchedKeywords.includes(kw)) {
                    matchedKeywords.push(kw);
                }
                dataMatch.push({
                    keyword: kw,
                    found_in_phrases: matchingPhrases
                });
            }
        }

        if (matchedKeywords.length < MIN_KEYWORD_MATCHES) {
            continue; 
        }

        const similarityScore = similarities[i];
        const relevanceStr = `(${matchedKeywords.length}/${queryKeywords.length} keywords matched)`;

        finalResults.appendWrapper = { 
            ...activity,
            similarity: similarityScore,
            relevance: relevanceStr,
            matched_keywords: matchedKeywords,
            matched_data: dataMatch
        };
        finalResults.push(finalResults.appendWrapper);
    }

    // Deduplication -> Eliminates redundant or duplicate data and points to a single instance instead
    const seenTitles = new Set();
    const uniqueRecommendations = [];
    
    for (const rec of finalResults) {
        const title = rec.Judul || rec.title;
        if (!seenTitles.has(title)) {
            uniqueRecommendations.push(rec);
            seenTitles.add(title);
        }
    }

    // Metrics Calculation
    const truePositiveActivities = uniqueRecommendations.length;
    const precision = uniqueRecommendations.length > 0 ? 1.0 : 0;
    const recall = totalRelevantCount > 0 ? (truePositiveActivities / totalRelevantCount) : 0;
    const f1_score = (precision + recall) > 0 ? (2 * (precision * recall) / (precision + recall)) : 0;

    const metrics = {
        precision: precision,
        recall: recall,
        f1_score: f1_score,
        total_found_activities: totalRelevantCount,
        relevant_activities: truePositiveActivities
    };

    return {
        recommendations: uniqueRecommendations,
        metrics: metrics
    };
}