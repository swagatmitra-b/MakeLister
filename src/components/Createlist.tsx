"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, ChangeEvent, MouseEvent, useRef } from "react";
import { FaArrowUp, FaArrowDown, FaTrash } from "react-icons/fa";
import { BsPlusLg } from "react-icons/bs";

interface Info {
  username: string
  id?: number;
  title: string;
  info: string;
  time?: {
    createdAt: string;
    updatedAt: string;
  };
}

const Createlist = ({ id, title, info, time, username }: Info) => {
  const parentDivRef = useRef<HTMLDivElement | null>(null);
  const path = usePathname();
  const router = useRouter();
  const [listTitle, setListTitle] = useState(title);
  const [listMembers, setListMembers] = useState(info.split(";"));
  console.log(username);
  const add = (e: MouseEvent) => {
    const target = e.currentTarget as HTMLButtonElement;
    const parent = target.parentElement as HTMLElement;
    const swapInput = parent.querySelector("#swap") as HTMLInputElement;
    const updatedListMembers = [...listMembers];
    console.log(swapInput.value);
    console.log(updatedListMembers[+swapInput.value]);
    updatedListMembers.splice(+swapInput.value, 0, "");
    setListMembers(updatedListMembers);
  };

  const del = (e: MouseEvent) => {
    const target = e.currentTarget as HTMLButtonElement;
    const parent = target.parentElement as HTMLElement;
    const swapInput = parent.querySelector("#swap") as HTMLInputElement;
    let updatedListMembers = [...listMembers];
    updatedListMembers.splice(+swapInput.value - 1, 1);
    setListMembers(updatedListMembers);
  };

  const up = (e: MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    const grandParent = target.parentElement?.parentElement as HTMLElement;
    const inputVal = grandParent.querySelector("input") as HTMLInputElement;
    if (inputVal.value == "") return;
    const id = Number(grandParent.getAttribute("id"));
    if (id == 0) return;
    else {
      let updatedList = [...listMembers];
      const temp = updatedList[id - 1];
      updatedList[id - 1] = updatedList[id];
      updatedList[id] = temp;
      setListMembers(updatedList);
    }
  };
  const down = (e: MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    const grandParent = target.parentElement?.parentElement as HTMLElement;
    const inputVal = grandParent.querySelector("input") as HTMLInputElement;
    if (inputVal.value == "") return;
    const id = Number(grandParent.getAttribute("id"));
    if (id == listMembers.length - 1) return;
    else {
      let updatedList = [...listMembers];
      const temp = updatedList[id + 1];
      updatedList[id + 1] = updatedList[id];
      updatedList[id] = temp;
      setListMembers(updatedList);
    }
  };
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const id = Number(e.target.parentElement?.getAttribute("id"));
    let updatedList = [...listMembers];
    updatedList[id] = e.target.value;
    setListMembers(updatedList);
  };

  const saveList = async (targetElem: HTMLButtonElement) => {
    targetElem.innerText = "Saving...";
    try {
      const res = await fetch("/api/usersavelist", {
        method: "POST",
        body: JSON.stringify({ id, title: listTitle, listMembers, username }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        console.log(data);
        targetElem.innerText = "Saved";
        setTimeout(() => (targetElem.innerText = "Save"), 1500);
      } else {
        targetElem.innerText = "Oops :(";
        setTimeout(() => (targetElem.innerText = "Save"), 2000);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const createList = async () => {
    try {
      const res = await fetch("/api/usercreatelist", {
        method: "POST",
        body: JSON.stringify({ username, title: listTitle, listMembers }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        console.log(data);
        router.push("/");
      } else {
        console.error("Error:");
      }
    } catch (err) {
      console.error("Fetch error", err);
    }
  };

  const swapfn = (e: MouseEvent) => {
    const target = e.target as HTMLButtonElement;
    const parent = target.parentElement as HTMLElement;
    const swapInput = parent.querySelector("#swap") as HTMLInputElement;
    const nextVal = swapInput.nextElementSibling as HTMLInputElement;
    const main = parentDivRef.current as HTMLElement;
    const inputArray: HTMLInputElement[] = Array.from(
      main.querySelectorAll("input#swap")
    );
    if (Number.isNaN(+swapInput.value) || +swapInput.value > listMembers.length) {
      inputArray.forEach((input, i) => (input.value = String(i + 1)));
      return;
    }
    const updatedList = [...listMembers];
    const a = updatedList[+swapInput.value - 1];
    updatedList.splice(+swapInput.value - 1, 1, nextVal.value);
    updatedList.splice(+swapInput.defaultValue - 1, 1, a);
    setListMembers(updatedList);

    inputArray.forEach((input, i) => (input.value = String(i + 1)));
  };

  return (
    <div
      className="flex flex-col mt-10 w-5/6 text-center mb-20"
      ref={parentDivRef}
    >
      <div>
        <input
          type="text"
          value={listTitle}
          onChange={(e) => setListTitle(e.target.value)}
          className="text-3xl p-2 h-11 w-1/2 text-center"
        />
      </div>
      <div className="flex justify-center mt-5">
        <button
          className="p-2 border-2 border-black rounded-md w-1/6 text-lg mb-9"
          onClick={(e) => {
            const target = e.target as HTMLButtonElement;
            if (target.innerText == "Create") createList();
            else saveList(target);
          }}
        >
          {path == "/newlist" ? "Create" : "Save"}
        </button>
      </div>
      {time ? (
        <div className="flex flex-col gap-2 italic mb-4">
          <h1>Created: {time.createdAt}</h1>
          <h1>Last Updated: {time.updatedAt}</h1>
        </div>
      ) : null}
      {listMembers.map((list, i) => (
        <div
          className="flex gap-4 border border-gray-400 p-3"
          key={i}
          id={String(i)}
        >
          <input
            className="text-3xl mt-2 w-16 text-center px-1"
            defaultValue={i + 1}
            id="swap"
          />
          <input
            type="text"
            value={list}
            className="border-2 border-black rounded-md h-14 text-2xl pl-2 w-5/6"
            onChange={handleChange}
            id="listinput"
          />
          <button
            className="border-2 border-black p-2 text-lg rounded-md"
            onClick={add}
          >
            <BsPlusLg />
          </button>
          <button
            className="border-2 border-black p-2 text-lg rounded-md"
            onClick={del}
          >
            <FaTrash />
          </button>
          <div className="flex flex-col">
            <button
              className="border-2 border-black p-1 rounded-sm"
              onClick={up}
            >
              <FaArrowUp />
            </button>
            <button
              className="border-2 border-black p-1 rounded-sm"
              onClick={down}
            >
              <FaArrowDown />
            </button>
          </div>
          <button
            className="border-2 border-black p-3 rounded-md"
            onClick={swapfn}
          >
            Swap
          </button>
        </div>
      ))}
    </div>
  );
};

export default Createlist;
