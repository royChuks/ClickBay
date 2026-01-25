interface AnalyticsData {
    sentiment: {
        score: number;
        label: string;
        confidence: number;
        positive: number;
        neutral: number;
        negative: number;
    };
    keywords: Array<{
        word: string;
        size: 'xl' | 'lg' | 'md' | 'sm' | 'xs';
        frequency: number;
    }>;
    entities: {
        people: Array<{
            name: string;
            initials: string;
            mentions: number;
        }>;
        places: Array<{
            name: string;
            initials: string;
            mentions: number;
        }>;
        organizations: Array<{
            name: string;
            initials: string;
            mentions: number;
        }>;
    };
    topics: Array<{
        name: string;
        percentage: number;
        color: string;
    }>;
    social: {
        likes: number;
        comments: number;
        shares: number;
        views: number;
        engagementRate: number;
    };
    content: {
        summary: string;
        wordCount: number;
        sentenceCount: number;
        readTime: string;
    };
    stats: {
        totalViews: string;
        totalEngagement: string;
        sentimentScore: string;
        keywordsFound: number;
    };
}
declare function analyzeContent(url: string): void;
declare function generateMockData(url: string): AnalyticsData;
declare function updateDashboard(data: AnalyticsData): void;
export { analyzeContent, generateMockData, updateDashboard };
//# sourceMappingURL=analytics.d.ts.map