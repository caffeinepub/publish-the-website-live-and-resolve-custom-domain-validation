import Map "mo:core/Map";
import Order "mo:core/Order";
import Array "mo:core/Array";
import List "mo:core/List";
import Blob "mo:core/Blob";
import Text "mo:core/Text";
import Nat32 "mo:core/Nat32";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Use the migration module in the with clause
actor {
  // DATA TYPES

  public type Language = {
    #english;
    #hindi;
  };

  public type BilingualText = {
    english : Text;
    hindi : Text;
  };

  public type OrganizationDetails = {
    name : BilingualText;
    logo : ?Storage.ExternalBlob;
    address : BilingualText;
    email : Text;
    phone : Text;
    facebookLink : Text;
    mission : BilingualText;
  };

  public type Project = {
    id : Text;
    title : BilingualText;
    description : BilingualText;
    image : ?Storage.ExternalBlob;
  };

  public type GalleryImage = {
    id : Text;
    image : Storage.ExternalBlob;
    caption : BilingualText;
  };

  public type ContactMessage = {
    id : Text;
    name : Text;
    email : Text;
    message : Text;
  };

  public type UserProfile = {
    name : Text;
  };

  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // DECISION: Use persistent storage for blob files
  include MixinStorage();

  // USER PROFILES
  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not AccessControl.isAdmin(accessControlState, caller) and caller != user) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ORGANIZATION DETAILS

  var organizationDetails : OrganizationDetails = {
    name = {
      english = "Uthaan Sewa Samiti";
      hindi = "उत्थान सेवा समिति";
    };
    logo = null;
    address = {
      english = "123 NGO Street, City";
      hindi = "१२३ एनजीओ सड़क, शहर";
    };
    email = "contact@uthaansewa.org";
    phone = "123-456-7890";
    facebookLink = "https://facebook.com/uthaansewa";
    mission = {
      english = "Dedicated to serving the community through various social initiatives.";
      hindi = "समाज की सेवा के लिए विविध सामाजिक पहलों के साथ समर्पित।";
    };
  };

  public query ({ caller }) func getOrganizationDetails() : async OrganizationDetails {
    organizationDetails;
  };

  // ABOUT US

  var aboutUsContent : BilingualText = {
    english = "Uthaan Sewa Samiti is committed to community welfare and development.";
    hindi = "उत्थान सेवा समिति समाज कल्याण और विकास के लिए प्रतिबद्ध है।";
  };

  public query ({ caller }) func getAboutUsContent() : async BilingualText {
    aboutUsContent;
  };

  // PROJECTS

  let projects = Map.empty<Text, Project>();

  module Project {
    public func compareByTitle(p1 : Project, p2 : Project) : Order.Order {
      Text.compare(p1.id, p2.id);
    };
  };

  public query ({ caller }) func getProjects() : async [Project] {
    projects.values().toArray().sort(Project.compareByTitle);
  };

  // GALLERY

  let galleryImages = Map.empty<Text, GalleryImage>();

  module GalleryImage {
    public func compareByCaption(g1 : GalleryImage, g2 : GalleryImage) : Order.Order {
      Text.compare(g1.caption.english, g2.caption.english);
    };
  };

  public query ({ caller }) func getGalleryImages() : async [GalleryImage] {
    galleryImages.values().toArray().sort(GalleryImage.compareByCaption);
  };

  // HOMEPAGE SLIDER IMAGES

  let homepageImages = Map.empty<Text, GalleryImage>();

  public query ({ caller }) func getHomepageImages() : async [GalleryImage] {
    homepageImages.values().toArray();
  };

  // CONTACT MESSAGES

  let contactMessages = Map.empty<Text, ContactMessage>();

  public query ({ caller }) func getContactMessages() : async [ContactMessage] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can view contact messages");
    };
    contactMessages.values().toArray();
  };

  // ADMIN FUNCTIONS

  public shared ({ caller }) func updateOrganizationDetails(details : OrganizationDetails) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can update organization details");
    };
    organizationDetails := details;
  };

  public shared ({ caller }) func updateAboutUsContent(content : BilingualText) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can update About Us content");
    };
    aboutUsContent := content;
  };

  public shared ({ caller }) func addProject(project : Project) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can add projects");
    };
    projects.add(project.id, project);
  };

  public shared ({ caller }) func updateProject(project : Project) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can update projects");
    };
    if (not projects.containsKey(project.id)) {
      Runtime.trap("Project not found");
    };
    projects.add(project.id, project);
  };

  public shared ({ caller }) func deleteProject(id : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can delete projects");
    };
    if (not projects.containsKey(id)) {
      Runtime.trap("Project not found");
    };
    projects.remove(id);
  };

  public shared ({ caller }) func addGalleryImage(image : GalleryImage) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can add gallery images");
    };
    galleryImages.add(image.id, image);
  };

  public shared ({ caller }) func deleteGalleryImage(id : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can delete gallery images");
    };
    if (not galleryImages.containsKey(id)) {
      Runtime.trap("Gallery image not found");
    };
    galleryImages.remove(id);
  };

  public shared ({ caller }) func addHomepageImage(image : GalleryImage) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can add homepage images");
    };
    homepageImages.add(image.id, image);
  };

  public shared ({ caller }) func deleteHomepageImage(id : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can delete homepage images");
    };
    if (not homepageImages.containsKey(id)) {
      Runtime.trap("Homepage image not found");
    };
    homepageImages.remove(id);
  };

  public shared ({ caller }) func addContactMessage(message : ContactMessage) : async () {
    // Public function - anyone including guests can submit contact messages
    contactMessages.add(message.id, message);
  };
};
