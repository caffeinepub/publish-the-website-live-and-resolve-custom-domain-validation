import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface BilingualText {
    hindi: string;
    english: string;
}
export interface OrganizationDetails {
    mission: BilingualText;
    logo?: ExternalBlob;
    name: BilingualText;
    email: string;
    address: BilingualText;
    facebookLink: string;
    phone: string;
}
export interface ContactMessage {
    id: string;
    name: string;
    email: string;
    message: string;
}
export interface GalleryImage {
    id: string;
    caption: BilingualText;
    image: ExternalBlob;
}
export interface Project {
    id: string;
    title: BilingualText;
    description: BilingualText;
    image?: ExternalBlob;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addContactMessage(message: ContactMessage): Promise<void>;
    addGalleryImage(image: GalleryImage): Promise<void>;
    addHomepageImage(image: GalleryImage): Promise<void>;
    addProject(project: Project): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteGalleryImage(id: string): Promise<void>;
    deleteHomepageImage(id: string): Promise<void>;
    deleteProject(id: string): Promise<void>;
    getAboutUsContent(): Promise<BilingualText>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContactMessages(): Promise<Array<ContactMessage>>;
    getGalleryImages(): Promise<Array<GalleryImage>>;
    getHomepageImages(): Promise<Array<GalleryImage>>;
    getOrganizationDetails(): Promise<OrganizationDetails>;
    getProjects(): Promise<Array<Project>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateAboutUsContent(content: BilingualText): Promise<void>;
    updateOrganizationDetails(details: OrganizationDetails): Promise<void>;
    updateProject(project: Project): Promise<void>;
}
