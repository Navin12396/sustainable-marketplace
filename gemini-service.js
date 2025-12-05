// Replace with your actual Gemini API Key
const GEMINI_API_KEY = "AIzaSyDKNZ7TlweKriVfA3TpzfQUrvHjGhpLklQ";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

export const getAIRecommendations = async (itemData) => {
    try {
        const prompt = `You are a sustainability expert. Analyze this item for the most environmentally friendly disposal/reuse options:

Item: ${itemData.name || 'Unnamed item'}
Category: ${itemData.category || 'General'}
Condition: ${itemData.condition || 'Unknown'}
Materials: ${itemData.materials || 'Not specified'}
Description: ${itemData.description || 'No description provided'}

Provide recommendations in this JSON format:
{
    "recommendations": [
        {
            "type": "reuse/recycle/donate/repair",
            "action": "Specific action to take",
            "confidence": 85,
            "reason": "Why this is environmentally beneficial",
            "estimatedImpact": "CO2 saved, water saved, etc."
        }
    ],
    "bestOption": "Type of best option",
    "localSuggestions": ["Local resource 1", "Local resource 2"]
}

Keep responses concise and practical.`;

        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const textResponse = data.candidates[0].content.parts[0].text;
        
        // Extract JSON from response
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        
        // Fallback recommendations if JSON parsing fails
        return getFallbackRecommendations(itemData.category);
        
    } catch (error) {
        console.error("Gemini API Error:", error);
        // Return fallback recommendations
        return getFallbackRecommendations(itemData.category);
    }
};

// Fallback recommendations in case API fails
const getFallbackRecommendations = (category) => {
    const recommendations = {
        'electronics': {
            recommendations: [
                {
                    type: "recycle",
                    action: "Take to e-waste recycling center",
                    confidence: 90,
                    reason: "Electronics contain toxic materials that should be properly disposed",
                    estimatedImpact: "Prevents soil and water contamination"
                },
                {
                    type: "reuse",
                    action: "Donate to schools or community centers",
                    confidence: 75,
                    reason: "Extends device lifespan and helps others",
                    estimatedImpact: "Saves manufacturing resources"
                }
            ],
            bestOption: "recycle",
            localSuggestions: ["Best Buy recycling", "Staples e-waste program", "Local electronics repair shop"]
        },
        'clothing': {
            recommendations: [
                {
                    type: "donate",
                    action: "Donate to local shelter or thrift store",
                    confidence: 95,
                    reason: "Helps people in need and reduces textile waste",
                    estimatedImpact: "Saves 2,700 liters of water per item"
                },
                {
                    type: "recycle",
                    action: "Textile recycling program",
                    confidence: 80,
                    reason: "Clothing can be turned into insulation or rags",
                    estimatedImpact: "Reduces landfill waste by 5%"
                }
            ],
            bestOption: "donate",
            localSuggestions: ["Goodwill", "Salvation Army", "Local clothing banks"]
        },
        'books': {
            recommendations: [
                {
                    type: "donate",
                    action: "Donate to libraries or schools",
                    confidence: 98,
                    reason: "Promotes literacy and education",
                    estimatedImpact: "Saves trees and reduces paper waste"
                },
                {
                    type: "reuse",
                    action: "Community book swap",
                    confidence: 85,
                    reason: "Builds community and reduces consumption",
                    estimatedImpact: "Extends book lifespan 5x"
                }
            ],
            bestOption: "donate",
            localSuggestions: ["Local library", "School donation drives", "Little Free Libraries"]
        }
    };

    return recommendations[category] || {
        recommendations: [
            {
                type: "reuse",
                action: "List on marketplace for someone else to use",
                confidence: 70,
                reason: "Gives item second life and reduces waste",
                estimatedImpact: "Reduces carbon footprint by 2.5kg"
            },
            {
                type: "recycle",
                action: "Find appropriate recycling facility",
                confidence: 60,
                reason: "Proper disposal prevents environmental harm",
                estimatedImpact: "Conserves natural resources"
            }
        ],
        bestOption: "reuse",
        localSuggestions: ["Local recycling center", "Community marketplace", "Online swap groups"]
    };
};

export const generateItemDescription = async (itemName, category) => {
    try {
        const prompt = `Generate a compelling, eco-friendly description for a ${category} item named "${itemName}" for a sustainable marketplace. 
        Include why reusing/recycling this item is environmentally beneficial. Keep it under 150 characters.`;

        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (response.ok) {
            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        }
        
        throw new Error('API call failed');
        
    } catch (error) {
        // Fallback description
        return `A ${category} item that deserves a second life! Help reduce waste and promote circular economy by giving this item a new home.`;
    }
};