import Image from "next/image";
import VesselTable from "./_components/vessel-table";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center w-dvw  justify-center p-4">
      <VesselTable />
    </main>
  );
}
