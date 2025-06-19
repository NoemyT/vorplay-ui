import { TiHeartFullOutline } from "react-icons/ti";
//import { Card } from "../ui/Card";

export default function Favorites() {
  return (
    <div className="flex flex-col w-full h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 text-2xl font-bold text-white">
        <TiHeartFullOutline className="text-[#8a2be2]" size={28} />
        <span>Favorites</span>
      </div>

      {/* Reviews list or empty state
      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-white text-center opacity-70">
          <TiHeartFullOutline size={48} className="mb-4 text-[#8a2be2]" />
          <p className="text-lg">You haven’t written any reviews yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto pr-2 max-h-[calc(100%-64px)]">
          {favorites.map((favorite) => (
            <Card
              key={favorite.id}
              className="bg-white/5 border border-white/10 p-4 rounded-xl text-white"
            >
              <h3 className="text-lg font-semibold mb-1">{favorite.title}</h3>
              <p className="text-sm opacity-80">{favorite.content}</p>
            </Card>
          ))}
        </div>
      )} */}
    </div>
  );
}
