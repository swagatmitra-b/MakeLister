"use client";

import Createlist from "@/components/Createlist";
import { useEffect, useState } from "react";
import { List } from "@/lib/types";
import Link from "next/link";
import { AiFillHome } from "react-icons/ai";
import formatDateTime from "@/lib/isoconverter";
import { useSession } from "next-auth/react";

const page = ({ params }: any) => {
  const { data: session } = useSession();
  const username = session?.user?.name as string;
  let [stringId, ...rest] = decodeURI(params.href).split(" ");
  const id = +stringId;
  const title = rest.join(" ");
  const [time, setTime] = useState({
    createdAt: "",
    updatedAt: "",
  });
  const [list, setList] = useState<List | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    fetch("/api/useronelist", {
      method: "POST",
      body: JSON.stringify({ id, username }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setList(data.list);
        setTime({
          updatedAt: formatDateTime(data.list.updatedAt),
          createdAt: formatDateTime(data.list.createdAt),
        });
        setLoading(true);
      });
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 max-w-screen-2xl">
      <Link href="/home">
        <button className="sm:absolute sm:top-10 sm:left-32 text-lg p-2 rounded-md border-2 border-black absolute left-8 top-6">
          <AiFillHome />
        </button>
      </Link>
      {loading && list ? (
        <Createlist
          id={id}
          title={title}
          info={list.content}
          time={time}
          username={username}
        />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default page;
