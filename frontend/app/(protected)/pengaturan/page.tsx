"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Mail, Lock, Eye, EyeOff, Save } from "lucide-react";
import { toast } from "sonner";

export default function PengaturanPage() {
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    emailPassword: false,
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [emailForm, setEmailForm] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setEmailForm((prev) => ({ ...prev, email: data.email }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, []);

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailForm.email) {
      toast.error("Email tidak boleh kosong");
      return;
    }

    if (!emailForm.password) {
      toast.error("Password wajib diisi untuk mengubah email");
      return;
    }

    setIsLoadingEmail(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/update-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: emailForm.email,
            password: emailForm.password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Email berhasil diubah!");
        setEmailForm({ ...emailForm, password: "" });
      } else {
        toast.error(data.message || "Gagal mengubah email");
      }
    } catch (error) {
      toast.error("Gagal mengubah email");
    } finally {
      setIsLoadingEmail(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordForm.oldPassword) {
      toast.error("Password lama wajib diisi");
      return;
    }

    if (!passwordForm.newPassword) {
      toast.error("Password baru wajib diisi");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Password baru minimal 6 karakter");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }

    setIsLoadingPassword(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/update-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            oldPassword: passwordForm.oldPassword,
            newPassword: passwordForm.newPassword,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Password berhasil diubah!");
        setPasswordForm({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(data.message || "Gagal mengubah password");
      }
    } catch (error) {
      toast.error("Gagal mengubah password");
    } finally {
      setIsLoadingPassword(false);
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-4 lg:p-8 shadow-lg">
        <div className="absolute -right-8 -top-8 opacity-20">
          <Settings className="h-64 w-64 text-white" strokeWidth={0.5} />
        </div>
        <div className="relative">
          <div className="mb-2 lg:mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 lg:px-4 lg:py-1.5 text-xs lg:text-sm font-medium text-white backdrop-blur-sm">
            <Settings className="h-3 w-3 lg:h-4 lg:w-4" />
            Pengaturan
          </div>
          <h1 className="mb-1 lg:mb-2 text-2xl lg:text-4xl font-bold text-white">
            Pengaturan Akun
          </h1>
          <p className="max-w-2xl text-sm lg:text-lg text-emerald-50">
            Kelola email dan password akun Anda
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Ubah Email */}
        <Card className="border-zinc-200 bg-white">
          <CardHeader className="p-4 lg:p-6">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-sm lg:text-base font-semibold text-emerald-700">
                Ubah Email
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 lg:p-6 pt-0">
            <form onSubmit={handleUpdateEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs lg:text-sm">
                  Email Baru
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Masukkan email baru"
                  value={emailForm.email}
                  onChange={(e) =>
                    setEmailForm({ ...emailForm, email: e.target.value })
                  }
                  className="text-xs lg:text-sm h-9 lg:h-10"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailPassword" className="text-xs lg:text-sm">
                  Password (untuk konfirmasi)
                </Label>
                <div className="relative">
                  <Input
                    id="emailPassword"
                    type={showPasswords.emailPassword ? "text" : "password"}
                    placeholder="Masukkan password Anda"
                    value={emailForm.password}
                    onChange={(e) =>
                      setEmailForm({ ...emailForm, password: e.target.value })
                    }
                    className="text-xs lg:text-sm h-9 lg:h-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("emailPassword")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    {showPasswords.emailPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-xs lg:text-sm h-9 lg:h-10"
                disabled={isLoadingEmail}
              >
                <Save className="mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                {isLoadingEmail ? "Menyimpan..." : "Simpan Email"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Ubah Password */}
        <Card className="border-zinc-200 bg-white">
          <CardHeader className="p-4 lg:p-6">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-sm lg:text-base font-semibold text-emerald-700">
                Ubah Password
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 lg:p-6 pt-0">
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="oldPassword" className="text-xs lg:text-sm">
                  Password Lama
                </Label>
                <div className="relative">
                  <Input
                    id="oldPassword"
                    type={showPasswords.oldPassword ? "text" : "password"}
                    placeholder="Masukkan password lama"
                    value={passwordForm.oldPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        oldPassword: e.target.value,
                      })
                    }
                    className="text-xs lg:text-sm h-9 lg:h-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("oldPassword")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    {showPasswords.oldPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-xs lg:text-sm">
                  Password Baru
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.newPassword ? "text" : "password"}
                    placeholder="Masukkan password baru"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    className="text-xs lg:text-sm h-9 lg:h-10 pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("newPassword")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    {showPasswords.newPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-zinc-500">Minimal 6 karakter</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-xs lg:text-sm">
                  Konfirmasi Password Baru
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirmPassword ? "text" : "password"}
                    placeholder="Ulangi password baru"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="text-xs lg:text-sm h-9 lg:h-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("confirmPassword")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    {showPasswords.confirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-xs lg:text-sm h-9 lg:h-10"
                disabled={isLoadingPassword}
              >
                <Save className="mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                {isLoadingPassword ? "Menyimpan..." : "Simpan Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
