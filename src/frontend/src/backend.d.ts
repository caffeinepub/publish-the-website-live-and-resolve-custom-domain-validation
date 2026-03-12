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
export interface Member {
    id: string;
    joinDate: string;
    name: BilingualText;
    role: BilingualText;
    memberType: MemberType;
    photo?: ExternalBlob;
}
export interface Project {
    id: string;
    title: BilingualText;
    description: BilingualText;
    image?: ExternalBlob;
}
export interface DonationDetails {
    accountNo: string;
    ifsc: string;
    description: BilingualText;
    bankName: string;
    upiId: string;
    accountHolder: string;
}
export interface UserProfile {
    name: string;
}
export enum MemberType {
    mainMember = "mainMember",
    coreCommittee = "coreCommittee",
    ordinaryMember = "ordinaryMember"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addContactMessage(message: ContactMessage): Promise<void>;
    addGalleryImage(sessionToken: string, image: GalleryImage): Promise<void>;
    addHomepageImage(sessionToken: string, image: GalleryImage): Promise<void>;
    addMember(sessionToken: string, member: Member): Promise<void>;
    addProject(sessionToken: string, project: Project): Promise<void>;
    adminLogin(username: string, passwordHash: string): Promise<string>;
    adminLogout(sessionToken: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteGalleryImage(sessionToken: string, id: string): Promise<void>;
    deleteHomepageImage(sessionToken: string, id: string): Promise<void>;
    deleteMember(sessionToken: string, id: string): Promise<void>;
    deleteProject(sessionToken: string, id: string): Promise<void>;
    getAboutUsContent(): Promise<BilingualText>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContactMessages(sessionToken: string): Promise<Array<ContactMessage>>;
    getCustomDomain(): Promise<string | null>;
    getDonationDetails(): Promise<DonationDetails>;
    getGalleryImages(): Promise<Array<GalleryImage>>;
    getHomepageImages(): Promise<Array<GalleryImage>>;
    getMembers(): Promise<Array<Member>>;
    getOrganizationDetails(): Promise<OrganizationDetails>;
    getProjects(): Promise<Array<Project>>;
    getAdminSecurityQuestionWithoutId(): Promise<string>;
    getSecurityQuestion(username: string): Promise<string>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isAdminSetup(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    resetAdminPassword(resetToken: string, newPasswordHash: string): Promise<void>;
    resetAdminCredentials(resetToken: string, newUsername: string, newPasswordHash: string): Promise<void>;
    clearAdminSetup(resetToken: string): Promise<void>;
    forceResetAdmin(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setCustomDomain(sessionToken: string, domain: string): Promise<void>;
    setupAdmin(username: string, passwordHash: string, securityQuestion: string, securityAnswerHash: string): Promise<void>;
    updateAboutUsContent(sessionToken: string, content: BilingualText): Promise<void>;
    updateDonationDetails(sessionToken: string, details: DonationDetails): Promise<void>;
    updateMember(sessionToken: string, member: Member): Promise<void>;
    updateOrganizationDetails(sessionToken: string, details: OrganizationDetails): Promise<void>;
    updateProject(sessionToken: string, project: Project): Promise<void>;
    validateAdminSession(sessionToken: string): Promise<boolean>;
    verifySecurityAnswer(username: string, answerHash: string): Promise<string>;
    verifySecurityAnswerWithoutId(answerHash: string): Promise<string>;
}
