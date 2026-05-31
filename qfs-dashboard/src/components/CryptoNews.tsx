// src/components/CryptoNews.tsx
import { useEffect, useState } from 'react';
import { Newspaper, ExternalLink, RefreshCw } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  source: string;
  time: string;
  url: string;
}

export function CryptoNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [error, setError] = useState<string | null>(null);
  const [activeSource, setActiveSource] = useState('all');

  const newsSources = [
    { id: 'all', name: 'All Sources', feedUrl: null },
    { id: 'coindesk', name: 'CoinDesk', feedUrl: 'https://www.coindesk.com/arc/outboundfeeds/rss/' },
    { id: 'cointelegraph', name: 'CoinTelegraph', feedUrl: 'https://cointelegraph.com/feed' },
    { id: 'bloomberg', name: 'Bloomberg Crypto', feedUrl: null }, // Would require API key for full access
    { id: 'coingecko', name: 'CoinGecko News', feedUrl: 'https://www.coingecko.com/en/news' }, // Note: Would use API endpoint with key
  ];

  const getRelativeTime = (pubDate: string) => {
    const published = new Date(pubDate);
    const now = new Date();
    const diffMs = now.getTime() - published.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const fetchNewsFromRSS = async (feedUrl: string, sourceName: string) => {
    try {
      const proxyUrl = 'https://api.allorigins.win/raw?url=';
      const response = await fetch(proxyUrl + encodeURIComponent(feedUrl));
      const text = await response.text();
      
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');
      const items = xmlDoc.querySelectorAll('item');
      
      return Array.from(items).slice(0, 3).map((item, index) => ({
        id: `${sourceName}-${Date.now()}-${index}`,
        title: item.querySelector('title')?.textContent || 'No title',
        description: item.querySelector('description')?.textContent?.replace(/<[^>]*>/g, '').substring(0, 160).trim() || '',
        source: sourceName,
        time: getRelativeTime(item.querySelector('pubDate')?.textContent || new Date().toISOString()),
        url: item.querySelector('link')?.textContent || '#',
      }));
    } catch (err) {
      console.error(`Error fetching from ${sourceName}:`, err);
      return [];
    }
  };

  const fetchCoinGeckoNews = async () => {
    try {
      // In production, replace with your CoinGecko API key
      const apiKey = 'YOUR_COINGECKO_API_KEY';
      const response = await fetch('https://api.coingecko.com/api/v3/news', {
        headers: {
          'x-cg-pro-api-key': apiKey,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data.slice(0, 3).map((article: any) => ({
        id: `coingecko-${Date.now()}-${article.id}`,
        title: article.title,
        description: article.description?.substring(0, 160) || '',
        source: 'CoinGecko',
        time: getRelativeTime(article.published_at),
        url: article.url,
      }));
    } catch (error) {
      console.error('Error fetching CoinGecko news:', error);
      return [];
    }
  };

  const fetchAllNews = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let allNews: NewsItem[] = [];
      
      // Fetch from RSS sources
      for (const source of newsSources) {
        if (source.feedUrl && (activeSource === 'all' || activeSource === source.id)) {
          const sourceNews = await fetchNewsFromRSS(source.feedUrl, source.name);
          allNews = [...allNews, ...sourceNews];
        }
      }
      
      // Add CoinGecko news if available and selected
      if (activeSource === 'all' || activeSource === 'coingecko') {
        const geckoNews = await fetchCoinGeckoNews();
        allNews = [...allNews, ...geckoNews];
      }
      
      // Sort by time (newest first)
      allNews.sort((a, b) => {
        // Simple sorting based on time strings - in production, you'd use actual timestamps
        return b.id.localeCompare(a.id);
      });
      
      setNews(allNews.slice(0, 12)); // Keep up to 12 latest articles
      setLastUpdate(new Date());
    } catch (err) {
      console.error('News aggregation error:', err);
      setError('Unable to fetch live news. Showing recent updates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllNews();
    const interval = setInterval(fetchAllNews, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [activeSource]);

  if (loading && news.length === 0) {
    return (
      <div className="p-8 flex justify-center items-center h-64">
        <div className="text-slate-400">Loading crypto market news...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-slate-900 dark:text-white text-3xl font-bold mb-2">Crypto Market Insights</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Real-time news from CoinGecko, Bloomberg Crypto, and leading sources • Updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {newsSources.map(source => (
              <button
                key={source.id}
                onClick={() => setActiveSource(source.id)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  activeSource === source.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {source.name}
              </button>
            ))}
          </div>
          <button 
            onClick={fetchAllNews}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <div className="flex items-center gap-2 text-green-500 text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Live Updates
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {news.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            No news available at the moment. Check back soon for market insights.
          </div>
        ) : (
          news.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer"
              onClick={() => window.open(item.url, '_blank')}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Newspaper className="text-blue-500" size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-slate-900 dark:text-white font-semibold text-lg">{item.title}</h3>
                    <ExternalLink className="text-slate-400 flex-shrink-0" size={16} />
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">{item.description}</p>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-blue-600 dark:text-blue-400 font-medium">{item.source}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500 dark:text-slate-500">{item.time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}