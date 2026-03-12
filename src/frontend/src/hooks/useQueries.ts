import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  BilingualText,
  ContactMessage,
  DonationDetails,
  GalleryImage,
  Member,
  OrganizationDetails,
  Project,
} from "../backend";
import { useAuth } from "../contexts/AuthContext";
import { useActor } from "./useActor";

// Organization Details
export function useGetOrganizationDetails() {
  const { actor, isFetching } = useActor();

  return useQuery<OrganizationDetails>({
    queryKey: ["organizationDetails"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getOrganizationDetails();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateOrganizationDetails() {
  const { actor } = useActor();
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (details: OrganizationDetails) => {
      if (!actor) throw new Error("Actor not available");
      if (!sessionToken) throw new Error("Not authenticated");
      return actor.updateOrganizationDetails(sessionToken, details);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizationDetails"] });
    },
  });
}

// About Us
export function useGetAboutUsContent() {
  const { actor, isFetching } = useActor();

  return useQuery<BilingualText>({
    queryKey: ["aboutUsContent"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAboutUsContent();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateAboutUsContent() {
  const { actor } = useActor();
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: BilingualText) => {
      if (!actor) throw new Error("Actor not available");
      if (!sessionToken) throw new Error("Not authenticated");
      return actor.updateAboutUsContent(sessionToken, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aboutUsContent"] });
    },
  });
}

// Projects
export function useGetProjects() {
  const { actor, isFetching } = useActor();

  return useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getProjects();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddProject() {
  const { actor } = useActor();
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (project: Project) => {
      if (!actor) throw new Error("Actor not available");
      if (!sessionToken) throw new Error("Not authenticated");
      return actor.addProject(sessionToken, project);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateProject() {
  const { actor } = useActor();
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (project: Project) => {
      if (!actor) throw new Error("Actor not available");
      if (!sessionToken) throw new Error("Not authenticated");
      return actor.updateProject(sessionToken, project);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDeleteProject() {
  const { actor } = useActor();
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      if (!sessionToken) throw new Error("Not authenticated");
      return actor.deleteProject(sessionToken, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

// Gallery
export function useGetGalleryImages() {
  const { actor, isFetching } = useActor();

  return useQuery<GalleryImage[]>({
    queryKey: ["galleryImages"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getGalleryImages();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddGalleryImage() {
  const { actor } = useActor();
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (image: GalleryImage) => {
      if (!actor) throw new Error("Actor not available");
      if (!sessionToken) throw new Error("Not authenticated");
      return actor.addGalleryImage(sessionToken, image);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleryImages"] });
    },
  });
}

export function useDeleteGalleryImage() {
  const { actor } = useActor();
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      if (!sessionToken) throw new Error("Not authenticated");
      return actor.deleteGalleryImage(sessionToken, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleryImages"] });
    },
  });
}

// Homepage Images
export function useGetHomepageImages() {
  const { actor, isFetching } = useActor();

  return useQuery<GalleryImage[]>({
    queryKey: ["homepageImages"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getHomepageImages();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddHomepageImage() {
  const { actor } = useActor();
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (image: GalleryImage) => {
      if (!actor) throw new Error("Actor not available");
      if (!sessionToken) throw new Error("Not authenticated");
      return actor.addHomepageImage(sessionToken, image);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homepageImages"] });
    },
  });
}

export function useDeleteHomepageImage() {
  const { actor } = useActor();
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      if (!sessionToken) throw new Error("Not authenticated");
      return actor.deleteHomepageImage(sessionToken, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homepageImages"] });
    },
  });
}

// Contact Messages
export function useGetContactMessages() {
  const { actor, isFetching } = useActor();
  const { sessionToken } = useAuth();

  return useQuery<ContactMessage[]>({
    queryKey: ["contactMessages"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      if (!sessionToken) throw new Error("Not authenticated");
      return actor.getContactMessages(sessionToken);
    },
    enabled: !!actor && !isFetching && !!sessionToken,
  });
}

export function useAddContactMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: ContactMessage) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addContactMessage(message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contactMessages"] });
    },
  });
}

// Custom Domain
export function useGetCustomDomain() {
  const { actor, isFetching } = useActor();

  return useQuery<string | null>({
    queryKey: ["customDomain"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCustomDomain();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetCustomDomain() {
  const { actor } = useActor();
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (domain: string) => {
      if (!actor) throw new Error("Actor not available");
      if (!sessionToken) throw new Error("Not authenticated");
      return actor.setCustomDomain(sessionToken, domain);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customDomain"] });
    },
  });
}

// Donation Details
export function useGetDonationDetails() {
  const { actor, isFetching } = useActor();

  return useQuery<DonationDetails>({
    queryKey: ["donationDetails"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getDonationDetails();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateDonationDetails() {
  const { actor } = useActor();
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (details: DonationDetails) => {
      if (!actor) throw new Error("Actor not available");
      if (!sessionToken) throw new Error("Not authenticated");
      return actor.updateDonationDetails(sessionToken, details);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donationDetails"] });
    },
  });
}

// Members
export function useGetMembers() {
  const { actor, isFetching } = useActor();

  return useQuery<Member[]>({
    queryKey: ["members"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getMembers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddMember() {
  const { actor } = useActor();
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (member: Member) => {
      if (!actor) throw new Error("Actor not available");
      if (!sessionToken) throw new Error("Not authenticated");
      return actor.addMember(sessionToken, member);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}

export function useUpdateMember() {
  const { actor } = useActor();
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (member: Member) => {
      if (!actor) throw new Error("Actor not available");
      if (!sessionToken) throw new Error("Not authenticated");
      return actor.updateMember(sessionToken, member);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}

export function useDeleteMember() {
  const { actor } = useActor();
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      if (!sessionToken) throw new Error("Not authenticated");
      return actor.deleteMember(sessionToken, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}
