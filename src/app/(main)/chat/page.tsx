import { Suspense } from "react";
import { ChatPage } from "@/components/pages/chat-page";

export default function Chat() {
  return (
    <Suspense>
      <ChatPage />
    </Suspense>
  );
}
