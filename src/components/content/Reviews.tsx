import { TiStarFullOutline } from "react-icons/ti";
import { Card } from "../ui/Card";
import { useEffect, useState } from "react";

// Example data — replace with actual user data later
const mockReviews = [
  {
    id: 1,
    title: "Song Title 1",
    content: "This track was amazing. Loved the rhythm and vibe.",
  },
  {
    id: 2,
    title: "Song Title 2",
    content: "Not really my style, but well produced.",
  },
  {
    id: 3,
    title: "Album XYZ",
    content: "Beautiful progression throughout the album.",
  },
];

export default function Reviews() {
  const [reviews, setReviews] = useState<typeof mockReviews>([]);

  useEffect(() => {
    // Simulate loading user data
    setTimeout(() => {
      setReviews(mockReviews); // swap with real fetch later
    }, 300);
  }, []);

  return (
    <div className="flex flex-col w-full h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 text-2xl font-bold text-white">
        <TiStarFullOutline className="text-[#8a2be2]" size={28} />
        <span>Reviews</span>
      </div>

      {/* Reviews list or empty state */}
      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-white text-center opacity-70">
          <TiStarFullOutline size={48} className="mb-4 text-[#8a2be2]" />
          <p className="text-lg">You haven’t written any reviews yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto pr-2 max-h-[calc(100%-64px)]">
          {reviews.map((review) => (
            <Card
              key={review.id}
              className="bg-white/5 border border-white/10 p-4 rounded-xl text-white"
            >
              <h3 className="text-lg font-semibold mb-1">{review.title}</h3>
              <p className="text-sm opacity-80">{review.content}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
