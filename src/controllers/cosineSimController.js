const { finalprojects, research, prodis, mahasiswas, dosens } = require('../databases/models');
const natural = require('natural');  // For TF-IDF and stemming
const stopword = require('stopword');  // For removing stopwords

// List of Indonesian stopwords
const stopwordsID = [
    'a', 'akan', 'adalah', 'agar', 'atau', 'baik', 'bagi', 'bahwa', 'bisa', 'di', 'dan', 'dari', 'dengan', 'ia', 'ini', 'itu', 'jika', 'kamu', 'kami', 'kita', 'lagi', 'lalu', 'maka', 'merupakan', 'sebagai', 'seperti', 'tapi', 'tersebut', 'untuk', 'yang'
];

// Preprocessing function to clean and prepare text
const preprocessText = text => {
    if (typeof text !== 'string') {
        throw new Error('Input text must be a string');
    }
    text = text.toLowerCase().replace(/[^\w\s]/g, '');  // Remove punctuation
    const tokens = text.split(/\s+/);  // Tokenize text

    // Remove stopwords using Indonesian stopwords list
    const filteredTokens = stopword.removeStopwords(tokens, stopwordsID);

    // Stemming (optional)
    const stemmer = natural.PorterStemmer;
    const stemmedTokens = filteredTokens.map(token => stemmer.stem(token));

    return stemmedTokens.join(' ');
}

// Function to calculate cosine similarity in percentage
const calculateCosineSimilarity = (tfidf, doc1Index, doc2Index) => {
    const terms1 = tfidf.listTerms(doc1Index);
    const terms2 = tfidf.listTerms(doc2Index);

    const termMap1 = terms1.reduce((map, term) => (map[term.term] = term.tfidf, map), {});
    const termMap2 = terms2.reduce((map, term) => (map[term.term] = term.tfidf, map), {});

    const allTerms = new Set([...Object.keys(termMap1), ...Object.keys(termMap2)]);
    const vector1 = [];
    const vector2 = [];

    allTerms.forEach(term => {
        vector1.push(termMap1[term] || 0);
        vector2.push(termMap2[term] || 0);
    });

    const dotProduct = vector1.reduce((sum, value, index) => sum + (value * vector2[index]), 0);
    const magnitude1 = Math.sqrt(vector1.reduce((sum, value) => sum + (value ** 2), 0));
    const magnitude2 = Math.sqrt(vector2.reduce((sum, value) => sum + (value ** 2), 0));

    // Calculate cosine similarity and convert it to percentage
    const similarity = dotProduct / (magnitude1 * magnitude2);
    return (similarity * 100).toFixed(2);  // Return as percentage with 2 decimal places
}

// Function to extract significant keywords from text
const extractKeywords = (text, numKeywords = 500) => {
    const tfidf = new natural.TfIdf();
    tfidf.addDocument(text);

    return tfidf.listTerms(0)
        .sort((a, b) => b.tfidf - a.tfidf)
        .slice(0, numKeywords)
        .map(term => term.term);
}

// Function to calculate similarities for documents
const calculateSimilarities = async (documents, inputText, type) => {
    const text1Clean = preprocessText(inputText);
    const tfidf = new natural.TfIdf();
    tfidf.addDocument(text1Clean);

    return Promise.all(documents.map(async doc => {
        if (typeof doc.abstract !== 'string') {
            return { id: doc[`${type}_id`], similarity: null, type };
        }

        const text2Clean = preprocessText(doc.abstract);
        tfidf.addDocument(text2Clean);

        const similarity = calculateCosineSimilarity(tfidf, 0, 1);
        return {
            id: doc[`${type}_id`],
            title: type === 'finalproject' ? doc.title : undefined,
            abstract: doc.abstract,
            createdAt: doc.createdAt,  // Additional attribute
            prodi: doc.prodi,          // Additional attribute
            mahasiswa: doc.mahasiswa,  // Additional attribute
            dosen: doc.dosen,          // Additional attribute
            total_views: doc.total_views, // Additional attribute
            similarity,  // Already formatted as percentage
            type
        };
    }));
}

// API function to get similarity
const getSimilarity = async (req, res) => {
    try {
        const { inputText } = req.body;

        // Ensure inputText is provided and is a string
        if (typeof inputText !== 'string' || !inputText.trim()) {
            return res.status(400).json({ error: 'Input text must be a non-empty string' });
        }

        // Retrieve documents from database
        const [researchAbstracts, finalProjectDescriptions] = await Promise.all([
            research.findAll({
                attributes: ['research_id', 'abstract', 'createdAt', 'prodi_id', 'total_views'],
                include: [
                    { model: prodis, attributes: ['nama_prodi'] },
                    { model: dosens , attributes: ['nama_dosen', 'nidn'] }
                ]
            }),
            finalprojects.findAll({
                attributes: ['project_id', 'title', 'abstract', 'createdAt', 'prodi_id', 'total_views'],
                include: [
                    { model: prodis, attributes: ['nama_prodi'] },
                    { model: mahasiswas, attributes: ['nama_mahasiswa', 'nim'] },
                ]
            })
        ]);

        if (researchAbstracts.length === 0 || finalProjectDescriptions.length === 0) {
            throw new Error('No research abstracts or final projects found');
        }

        // Extract keywords from input text
        const inputKeywords = extractKeywords(preprocessText(inputText));

        // Calculate similarities
        const [researchSimilarities, finalProjectSimilarities] = await Promise.all([
            calculateSimilarities(researchAbstracts, inputText, 'research'),
            calculateSimilarities(finalProjectDescriptions, inputText, 'finalproject')
        ]);

        // Combine results into one array
        const combinedSimilarities = [...researchSimilarities, ...finalProjectSimilarities];

        // Apply minimum similarity threshold
        const similarityThreshold = 10;  // Example threshold
        const filteredSimilarities = combinedSimilarities.filter(item => item.similarity >= similarityThreshold);

        // Sort combined results by similarity in descending order
        filteredSimilarities.sort((a, b) => b.similarity - a.similarity);

        // Return results with input keywords
        return res.json({
            message: 'Similarity calculation complete',
            keywords: inputKeywords.join(', '),
            projectSimilarities: filteredSimilarities
        });

    } catch (error) {
        console.error('Error calculating similarity:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {  
    getSimilarity
};
