"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import type { ApiResponse, User } from "@/types/api";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().min(6, "Phone must be at least 6 digits").max(20).optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function StudentProfilePage() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: user, isLoading } = useQuery({
    queryKey: ["users-me"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<User>>("/users/me");
      return res.data.data;
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (user) {
      reset({ name: user.name, phone: user.phone ?? "" });
    }
  }, [user, reset]);

  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const res = await apiClient.patch<ApiResponse<User>>("/users/me", {
        name: values.name,
        phone: values.phone || undefined,
      });
      return res.data.data;
    },
    onSuccess: (updated) => {
      updateUser({ name: updated.name });
      queryClient.invalidateQueries({ queryKey: ["users-me"] });
      toast.success("Profile updated successfully");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Failed to update profile"));
    },
  });

  const avatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await apiClient.patch<ApiResponse<User>>("/users/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data;
    },
    onSuccess: (updated) => {
      updateUser({ avatarUrl: updated.avatarUrl });
      queryClient.invalidateQueries({ queryKey: ["users-me"] });
      toast.success("Avatar uploaded to Cloudinary!");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Failed to upload avatar"));
    },
  });

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    avatarMutation.mutate(file);
  }

  if (isLoading) {
    return <Skeleton className="h-80 w-full rounded-xl" />;
  }

  const avatarSrc = previewUrl || user?.avatarUrl;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          My Profile
        </h1>
        <p className="text-sm text-slate-500">Manage your personal details and profile photo.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Photo</CardTitle>
          <CardDescription>Uploaded securely via Cloudinary.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-5">
          {avatarSrc ? (
            <Image
              src={avatarSrc}
              alt={user?.name ?? "Avatar"}
              width={72}
              height={72}
              className="h-18 w-18 rounded-full object-cover ring-2 ring-indigo-100"
            />
          ) : (
            <div className="flex h-18 w-18 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-700">
              {user?.name?.charAt(0)?.toUpperCase() ?? "S"}
            </div>
          )}
          <div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
              <Camera className="h-4 w-4" />
              {avatarMutation.isPending ? "Uploading..." : "Change Photo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={avatarMutation.isPending}
              />
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Student Code: <strong>{user?.studentProfile?.studentCode ?? "—"}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit((vals) => updateProfileMutation.mutate(vals))}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <Input value={user?.email ?? ""} disabled />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Full Name</label>
              <Input {...register("name")} />
              {errors.name && <p className="text-xs text-rose-600">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Phone</label>
              <Input {...register("phone")} />
              {errors.phone && <p className="text-xs text-rose-600">{errors.phone.message}</p>}
            </div>
            <Button type="submit" disabled={isSubmitting || updateProfileMutation.isPending}>
              <Save className="h-4 w-4" />
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
