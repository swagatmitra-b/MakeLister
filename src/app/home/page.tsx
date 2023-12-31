"use client";
import Listouter from "@/components/Listouter";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DeleteModal from "@/components/DeleteModal";
import { List } from "@/lib/types";
import { DeleteContext } from "@/lib/contextDispenser";
import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import Themebutton from "@/components/Themebutton";

export default function Home() {
  const { data: session } = useSession();
  const username = session?.user?.name as string;
  const router = useRouter();
  const [lists, setLists] = useState<List[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState({
    id: 0,
    clicked: false,
    confirm: false,
    userconfirm: false,
    userclicked: false,
  });

  const deleteList = async (id: number) => {
    try {
      const res = await fetch("/api/userdeletelist", {
        method: "DELETE",
        body: JSON.stringify({ id, username }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        setLists((prev) => prev.filter((list) => list.id != id));
        setModal({ ...modal, confirm: false });
      } else {
        console.log("ERROR!");
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetch("/api/usergetlist", {
      method: "POST",
      body: JSON.stringify({
        username,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setLists(data.post.sort((a: List, b: List) => b.id - a.id));
        setIsLoading(true);
      });
  }, []);

  useEffect(() => {
    if (modal.confirm) deleteList(modal.id);
  }, [modal.confirm]);

  useEffect(() => {
    if (modal.userconfirm) deleteUser();
  }, [modal.userconfirm]);

  const deleteUser = async () => {
    try {
      const res = await fetch("/api/userdeleteuser", {
        method: "DELETE",
        body: JSON.stringify({ username }),
      });
      if (res.ok) {
        signOut();
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (!session) {
    redirect("/");
  }

  return (
    <div className="flex justify-between max-w-screen-2xl max-h-full p-2 relative min-h-screen">
      <Themebutton />
      <DeleteContext.Provider value={{ modal, setModal }}>
        <div className="flex flex-col mx-auto gap-2 mt-7 w-5/6 text-center">
          <h1 className="font-serif text-4xl my-6">Makelister</h1>
          <div className="flex flex-col gap-2 italic mb-4">
            <h1>Logged in as {username}</h1>
          </div>
          <div className="sm:absolute top-16 sm:right-28 flex gap-5 ml-14 my-10">
            <button
              className="border-2 dark:border-white border-black p-2 rounded-md text-sm font-semibold  hover:bg-black hover:text-white ease-in duration-200 dark:hover:bg-white dark:hover:text-black"
              onClick={() => {
                signOut();
              }}
            >
              Sign Out
            </button>
            <button
              className="border-2 dark:border-white border-black p-2 rounded-md text-sm font-semibold  hover:bg-black hover:text-white ease-in duration-200 dark:hover:bg-white dark:hover:text-black"
              onClick={() => {
                setModal({ ...modal, clicked: true, userclicked: true });
              }}
            >
              Delete User
            </button>
          </div>
          <div className="flex justify-center mb-10">
            <button
              className="p-2 border-2 dark:border-white border-black rounded-lg text-2xl sm:w-1/4 hover:text-white hover:bg-black dark:hover:text-black dark:hover:bg-white duration-200"
              onClick={() => router.push("/home/newlist")}
            >
              Create List
            </button>
            <DeleteModal />
          </div>
          <div className="flex flex-wrap gap-4 text-center">
            {isLoading ? (
              lists.length != 0 ? (
                lists.map((list) => (
                  <Listouter
                    key={list.id}
                    id={list.id}
                    title={list.title}
                    content={list.content}
                  />
                ))
              ) : (
                <div className="w-full text-center sm:mt-40 mt-10">
                  <span className="sm:text-4xl text-lg">
                    No List to display
                  </span>
                </div>
              )
            ) : (
              <div className="w-full text-center mt-48">
                <span className="text-4xl">Loading...</span>
              </div>
            )}
          </div>
        </div>
      </DeleteContext.Provider>
    </div>
  );
}
