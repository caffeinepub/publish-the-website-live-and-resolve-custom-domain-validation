import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { OrganizationDetails, Project, GalleryImage, ContactMessage, BilingualText } from '../backend';

// Organization Details
export function useGetOrganizationDetails() {
  const { actor, isFetching } = useActor();

  return useQuery<OrganizationDetails>({
    queryKey: ['organizationDetails'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getOrganizationDetails();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateOrganizationDetails() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (details: OrganizationDetails) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateOrganizationDetails(details);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizationDetails'] });
    },
  });
}

// About Us
export function useGetAboutUsContent() {
  const { actor, isFetching } = useActor();

  return useQuery<BilingualText>({
    queryKey: ['aboutUsContent'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAboutUsContent();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateAboutUsContent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: BilingualText) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateAboutUsContent(content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aboutUsContent'] });
    },
  });
}

// Projects
export function useGetProjects() {
  const { actor, isFetching } = useActor();

  return useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getProjects();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (project: Project) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addProject(project);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (project: Project) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProject(project);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useDeleteProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteProject(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// Gallery
export function useGetGalleryImages() {
  const { actor, isFetching } = useActor();

  return useQuery<GalleryImage[]>({
    queryKey: ['galleryImages'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getGalleryImages();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddGalleryImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (image: GalleryImage) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addGalleryImage(image);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['galleryImages'] });
    },
  });
}

export function useDeleteGalleryImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteGalleryImage(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['galleryImages'] });
    },
  });
}

// Homepage Images
export function useGetHomepageImages() {
  const { actor, isFetching } = useActor();

  return useQuery<GalleryImage[]>({
    queryKey: ['homepageImages'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getHomepageImages();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddHomepageImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (image: GalleryImage) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addHomepageImage(image);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepageImages'] });
    },
  });
}

export function useDeleteHomepageImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteHomepageImage(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepageImages'] });
    },
  });
}

// Contact Messages
export function useGetContactMessages() {
  const { actor, isFetching } = useActor();

  return useQuery<ContactMessage[]>({
    queryKey: ['contactMessages'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getContactMessages();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddContactMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: ContactMessage) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addContactMessage(message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactMessages'] });
    },
  });
}
