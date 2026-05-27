"use client";

import { useState } from "react";
import api from "@/lib/axios";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function LoginPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {

    try {

      const response = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);

      router.push("/dashboard");

    } catch (error) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-rose-50 to-purple-100 p-6">

      <Card className="w-full max-w-md rounded-3xl border-0 shadow-2xl bg-white/80 backdrop-blur">

        <CardContent className="p-8 space-y-6">

          <div className="text-center space-y-2">

            <h1 className="text-4xl font-bold text-rose-500">
                Agenda ✨
            </h1>

            <p className="text-slate-500">
              Aqui podemos guardar nuestros recuerdos y planes
            </p>

          </div>

          <div className="space-y-2">

            <Label className="text-slate-600">
              Email
            </Label>

            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-2xl border-pink-200 focus-visible:ring-rose-300"
            />

          </div>

          <div className="space-y-2">

            <Label className="text-slate-600">
              Password
            </Label>

            <Input
              type="password"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-2xl border-pink-200 focus-visible:ring-rose-300"
            />

          </div>

          <Button
            className="w-full rounded-2xl bg-rose-400 hover:bg-rose-500 text-white text-base py-6"
            onClick={handleLogin}
          >
            Login 💖
          </Button>

        </CardContent>

      </Card>

    </div>
  );
}