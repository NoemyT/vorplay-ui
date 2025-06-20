import { Card, CardHeader } from "../ui/Card";
import logo from "../../assets/vorp.png";

export default function Welcome() {
  return (
    <div className="h-full w-full flex justify-center items-center">
      <div className="flex flex-col items-center gap-6 rounded-[20px] px-4 w-full max-w-[800px] mt-2">
        <Card
          className="
          flex flex-col lg:flex-row
          items-center
          justify-center lg:justify-start
          gap-4 lg:gap-8
          w-full max-w-[800px]
          min-h-[200px]
          bg-white/5 px-6 py-6 shadow-none text-center
        "
        >
          <div className="flex flex-col gap-2 h-full justify-center text-center flex-1">
            <span className="text-[#292928] text-lg sm:text-xl">
              Review songs from Spotify&copy; with
            </span>
            <span className="text-[#8a2be2] text-5xl sm:text-6xl font-bold">
              Vorplay
            </span>
          </div>

          <img
            src={logo}
            alt="Vorplay Logo"
            className="hidden lg:block w-[170px] h-[170px] rounded-full lg:mr-16"
          />
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full max-w-[800px]">
          <Card className="bg-white/5 rounded-[16px] p-6 h-[280px] text-white shadow-none flex flex-col justify-center items-center text-center gap-4">
            <CardHeader className="text-xl text-[#292928] mt-2">
              💜 your favorite songs
            </CardHeader>

            <div className="flex items-center w-full max-w-[200px] gap-2">
              <div className="flex-grow border-t border-white/30"></div>
              <span className="text-white/60 text-sm">or</span>
              <div className="flex-grow border-t border-white/30"></div>
            </div>

            <CardHeader className="text-xl text-[#292928]">
              Create playlists
            </CardHeader>
          </Card>
          <Card className="bg-white/5 rounded-[16px] p-6 h-[280px] text-white shadow-none flex flex-col justify-center items-center text-center gap-4">
            <CardHeader className="text-xl text-[#292928] mt-2">
              Revisit songs
            </CardHeader>

            <div className="flex items-center w-full max-w-[200px] gap-2">
              <div className="flex-grow border-t border-white/30"></div>
              <span className="text-white/60 text-sm">or</span>
              <div className="flex-grow border-t border-white/30"></div>
            </div>

            <CardHeader className="text-xl text-[#292928]">
              Follow other users
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
