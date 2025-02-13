import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import storiesApi, { NewsFeedStory } from "@/apis/stories.api";

interface StoryCardProps {
  item: NewsFeedStory;
}

const StoryCard: React.FC<StoryCardProps> = ({ item }) => {
  // Xác định màu viền avatar dựa trên trạng thái is_online của user
  const avatarBorderColor = item.user.is_online ? "border-blue-600" : "border-gray-800";

  return (
    <div className="w-36 h-52 rounded-xl overflow-hidden flex flex-col relative group cursor-pointer">
      <img
        className="w-full h-full object-cover transition duration-300 ease-in-out transform group-hover:scale-105"
        src={item.media_url}
        alt={item.content}
      />
      {item.user?.avatar && (
        <div className={`w-8 h-8 border-4 box-content ${avatarBorderColor} rounded-full overflow-hidden absolute left-2.5 top-3`}>
          <img className="w-full h-full object-cover" src={item.user.avatar} alt={item.content} />
        </div>
      )}
      <div className="absolute inset-x-3 bottom-1">
        <p className="text-white font-semibold">{item.content}</p>
      </div>
      <div className="absolute inset-0 bg-black opacity-0 transition duration-300 ease-in-out group-hover:opacity-20"></div>
    </div>
  );
};

const Story: React.FC = () => {
  const [startIndex, setStartIndex] = useState(0);
  const storiesPerPage = 5;

  const { data: stories, isLoading, error } = useQuery({
    queryKey: ["stories", startIndex],
    queryFn: async () => {
      // Tính toán page dựa trên startIndex và storiesPerPage
      const page = Math.floor(startIndex / storiesPerPage) + 1;
      const response = await storiesApi.getNewsFeedStories(storiesPerPage, page);
      return response.data.result;
    }
  });

  const handlePrev = () => {
    setStartIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    if (!stories) return;
    const maxStartIndex = stories.length - storiesPerPage;
    setStartIndex((prev) => Math.min(prev + 1, maxStartIndex));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6 text-white">
        Loading stories...
      </div>
    );
  }

  if (error || !stories) {
    return (
      <div className="min-h-screen bg-gray-900 p-6 text-white">
        Error loading stories
      </div>
    );
  }

  const visibleStories = stories.slice(startIndex, startIndex + storiesPerPage);

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto relative">
        <div className="px-12">
          <div className="flex space-x-2 justify-center">
            {visibleStories.map((item) => (
              <StoryCard key={item._id} item={item} />
            ))}
          </div>
        </div>

        {startIndex > 0 && (
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-700 hover:bg-gray-600 transition-colors duration-200 p-2 rounded-full cursor-pointer z-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {startIndex < stories.length - storiesPerPage && (
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-700 hover:bg-gray-600 transition-colors duration-200 p-2 rounded-full cursor-pointer z-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Story;
