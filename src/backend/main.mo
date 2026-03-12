import Map "mo:core/Map";

import Text "mo:core/Text";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";


import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Run migration on upgrade.

actor {
  var tokenCounter = 0;

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

  public type DonationDetails = {
    description : BilingualText;
    bankName : Text;
    accountNo : Text;
    ifsc : Text;
    upiId : Text;
    accountHolder : Text;
  };

  public type MemberType = {
    #coreCommittee;
    #mainMember;
    #ordinaryMember;
  };

  public type Member = {
    id : Text;
    name : BilingualText;
    role : BilingualText;
    photo : ?Storage.ExternalBlob;
    joinDate : Text;
    memberType : MemberType;
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

  public type AdminCredentials = {
    username : Text;
    passwordHash : Text;
    securityQuestion : Text;
    securityAnswerHash : Text;
    sessionToken : ?Text;
    sessionExpiry : Int;
    resetToken : ?Text;
  };

  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // DECISION: Use persistent storage for blob files
  include MixinStorage();

  // Persistent custom domain/namespace
  var customDomain : ?Text = null;

  public query ({ caller }) func getCustomDomain() : async ?Text {
    customDomain;
  };

  // ADMIN CREDENTIALS
  var adminCredentials : ?AdminCredentials = null;

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

  // ABOUT US
  var aboutUsContent : BilingualText = {
    english = "Uthaan Sewa Samiti is committed to community welfare and development.";
    hindi = "उत्थान सेवा समिति समाज कल्याण और विकास के लिए प्रतिबद्ध है।";
  };

  // DONATION DETAILS
  var donationDetails : DonationDetails = {
    description = {
      english = "Support our initiatives through donations!";
      hindi = "हमारी पहलों का समर्थन करें दान के माध्यम से!";
    };
    bankName = "ABC Bank";
    accountNo = "1234567890";
    ifsc = "ABC123456";
    upiId = "uthaansewa@upi";
    accountHolder = "Uthaan Sewa Samiti";
  };

  // MAPS FOR PROJECTS, GALLERY IMAGES, MEMBERS, HOMEPAGE IMAGES
  let projects = Map.empty<Text, Project>();
  let galleryImages = Map.empty<Text, GalleryImage>();
  let homepageImages = Map.empty<Text, GalleryImage>();
  let members = Map.empty<Text, Member>();

  let contactMessages = Map.empty<Text, ContactMessage>();

  // USER PROFILES
  let userProfiles = Map.empty<Principal, UserProfile>();

  // ADMIN AUTHENTICATION HELPERS
  func generateToken() : Text {
    let timeHex = Time.now().toText();
    let counterHex = tokenCounter.toText();
    tokenCounter += 1;
    timeHex # counterHex;
  };

  func isValidSession(sessionToken : Text) : Bool {
    switch (adminCredentials) {
      case (null) { false };
      case (?creds) {
        switch (creds.sessionToken) {
          case (null) { false };
          case (?token) {
            token == sessionToken and creds.sessionExpiry > Time.now();
          };
        };
      };
    };
  };

  // ADMIN FUNCTIONS
  public query ({ caller }) func isAdminSetup() : async Bool {
    switch (adminCredentials) {
      case (null) { false };
      case (_) { true };
    };
  };

  public shared ({ caller }) func setupAdmin(username : Text, passwordHash : Text, securityQuestion : Text, securityAnswerHash : Text) : async () {
    // No permission check here - this is a bootstrap function.
    // Protection: the inner switch traps if credentials are already set up.
    switch (adminCredentials) {
      case (null) {
        adminCredentials := ?{
          username;
          passwordHash;
          securityQuestion;
          securityAnswerHash;
          sessionToken = null;
          sessionExpiry = 0;
          resetToken = null;
        };
      };
      case (_) {
        Runtime.trap("Admin credentials already set up");
      };
    };
  };

  public shared ({ caller }) func adminLogin(username : Text, passwordHash : Text) : async Text {
    switch (adminCredentials) {
      case (null) { Runtime.trap("Admin credentials not set up") };
      case (?creds) {
        if (creds.username != username or creds.passwordHash != passwordHash) {
          Runtime.trap("Invalid credentials");
        };
        let token = generateToken();
        adminCredentials := ?{
          creds with
          sessionToken = ?token;
          sessionExpiry = Time.now() + 30 * 24 * 60 * 60 * 1_000_000_000;
        };
        token;
      };
    };
  };

  public query ({ caller }) func validateAdminSession(sessionToken : Text) : async Bool {
    isValidSession(sessionToken);
  };

  public shared ({ caller }) func adminLogout(sessionToken : Text) : async () {
    switch (adminCredentials) {
      case (null) { Runtime.trap("Admin credentials not set up") };
      case (?creds) {
        switch (creds.sessionToken) {
          case (null) { Runtime.trap("Not logged in") };
          case (?token) {
            if (token != sessionToken) {
              Runtime.trap("Invalid session token");
            };
            adminCredentials := ?{
              creds with sessionToken = null
            };
          };
        };
      };
    };
  };

  public query ({ caller }) func getSecurityQuestion(username : Text) : async Text {
    switch (adminCredentials) {
      case (null) { Runtime.trap("Admin credentials not set up") };
      case (?creds) {
        if (creds.username != username) {
          Runtime.trap("Username not found");
        };
        creds.securityQuestion;
      };
    };
  };

  // Get security question WITHOUT needing to know the Admin ID (for forgot-ID flow)
  public query ({ caller }) func getAdminSecurityQuestionWithoutId() : async Text {
    switch (adminCredentials) {
      case (null) { Runtime.trap("Admin credentials not set up") };
      case (?creds) {
        creds.securityQuestion;
      };
    };
  };

  public shared ({ caller }) func verifySecurityAnswer(username : Text, answerHash : Text) : async Text {
    switch (adminCredentials) {
      case (null) { Runtime.trap("Admin credentials not set up") };
      case (?creds) {
        if (creds.username != username or creds.securityAnswerHash != answerHash) {
          Runtime.trap("Incorrect answer");
        };
        let resetToken = generateToken();
        adminCredentials := ?{ creds with resetToken = ?resetToken };
        resetToken;
      };
    };
  };

  // Verify security answer WITHOUT knowing Admin ID (for forgot-ID flow)
  public shared ({ caller }) func verifySecurityAnswerWithoutId(answerHash : Text) : async Text {
    switch (adminCredentials) {
      case (null) { Runtime.trap("Admin credentials not set up") };
      case (?creds) {
        if (creds.securityAnswerHash != answerHash) {
          Runtime.trap("Incorrect answer");
        };
        let resetToken = generateToken();
        adminCredentials := ?{ creds with resetToken = ?resetToken };
        resetToken;
      };
    };
  };

  public shared ({ caller }) func resetAdminPassword(resetToken : Text, newPasswordHash : Text) : async () {
    switch (adminCredentials) {
      case (null) { Runtime.trap("Admin credentials not set up") };
      case (?creds) {
        switch (creds.resetToken) {
          case (null) { Runtime.trap("No valid reset token") };
          case (?token) {
            if (token != resetToken) {
              Runtime.trap("Invalid reset token");
            };
            adminCredentials := ?{
              creds with
              passwordHash = newPasswordHash;
              resetToken = null;
              sessionToken = null;
            };
          };
        };
      };
    };
  };

  // Reset both username (ID) and password together
  public shared ({ caller }) func resetAdminCredentials(resetToken : Text, newUsername : Text, newPasswordHash : Text) : async () {
    switch (adminCredentials) {
      case (null) { Runtime.trap("Admin credentials not set up") };
      case (?creds) {
        switch (creds.resetToken) {
          case (null) { Runtime.trap("No valid reset token") };
          case (?token) {
            if (token != resetToken) {
              Runtime.trap("Invalid reset token");
            };
            if (newUsername.size() == 0) {
              Runtime.trap("Username cannot be empty");
            };
            adminCredentials := ?{
              creds with
              username = newUsername;
              passwordHash = newPasswordHash;
              resetToken = null;
              sessionToken = null;
            };
          };
        };
      };
    };
  };

  // Clear admin setup so admin can re-register (requires valid reset token from security question)
  public shared ({ caller }) func clearAdminSetup(resetToken : Text) : async () {
    switch (adminCredentials) {
      case (null) { Runtime.trap("Admin credentials not set up") };
      case (?creds) {
        switch (creds.resetToken) {
          case (null) { Runtime.trap("No valid reset token") };
          case (?token) {
            if (token != resetToken) {
              Runtime.trap("Invalid reset token");
            };
            adminCredentials := null;
          };
        };
      };
    };
  };

  // Force reset admin without any token - allows fresh re-registration
  public shared ({ caller }) func forceResetAdmin() : async () {
    adminCredentials := null;
  };


  public shared ({ caller }) func setCustomDomain(sessionToken : Text, domain : Text) : async () {
    if (not isValidSession(sessionToken)) {
      Runtime.trap("Unauthorized: Invalid session token");
    };
    customDomain := ?domain;
  };

  public shared ({ caller }) func updateOrganizationDetails(sessionToken : Text, details : OrganizationDetails) : async () {
    if (not isValidSession(sessionToken)) {
      Runtime.trap("Unauthorized: Invalid session token");
    };
    organizationDetails := details;
  };

  public shared ({ caller }) func updateAboutUsContent(sessionToken : Text, content : BilingualText) : async () {
    if (not isValidSession(sessionToken)) {
      Runtime.trap("Unauthorized: Invalid session token");
    };
    aboutUsContent := content;
  };

  public shared ({ caller }) func updateDonationDetails(sessionToken : Text, details : DonationDetails) : async () {
    if (not isValidSession(sessionToken)) {
      Runtime.trap("Unauthorized: Invalid session token");
    };
    donationDetails := details;
  };

  public shared ({ caller }) func addProject(sessionToken : Text, project : Project) : async () {
    if (not isValidSession(sessionToken)) {
      Runtime.trap("Unauthorized: Invalid session token");
    };
    projects.add(project.id, project);
  };

  public shared ({ caller }) func updateProject(sessionToken : Text, project : Project) : async () {
    if (not isValidSession(sessionToken)) {
      Runtime.trap("Unauthorized: Invalid session token");
    };
    if (not projects.containsKey(project.id)) {
      Runtime.trap("Project not found");
    };
    projects.add(project.id, project);
  };

  public shared ({ caller }) func deleteProject(sessionToken : Text, id : Text) : async () {
    if (not isValidSession(sessionToken)) {
      Runtime.trap("Unauthorized: Invalid session token");
    };
    if (not projects.containsKey(id)) {
      Runtime.trap("Project not found");
    };
    projects.remove(id);
  };

  public shared ({ caller }) func addGalleryImage(sessionToken : Text, image : GalleryImage) : async () {
    if (not isValidSession(sessionToken)) {
      Runtime.trap("Unauthorized: Invalid session token");
    };
    galleryImages.add(image.id, image);
  };

  public shared ({ caller }) func deleteGalleryImage(sessionToken : Text, id : Text) : async () {
    if (not isValidSession(sessionToken)) {
      Runtime.trap("Unauthorized: Invalid session token");
    };
    if (not galleryImages.containsKey(id)) {
      Runtime.trap("Gallery image not found");
    };
    galleryImages.remove(id);
  };

  public shared ({ caller }) func addHomepageImage(sessionToken : Text, image : GalleryImage) : async () {
    if (not isValidSession(sessionToken)) {
      Runtime.trap("Unauthorized: Invalid session token");
    };
    homepageImages.add(image.id, image);
  };

  public shared ({ caller }) func deleteHomepageImage(sessionToken : Text, id : Text) : async () {
    if (not isValidSession(sessionToken)) {
      Runtime.trap("Unauthorized: Invalid session token");
    };
    if (not homepageImages.containsKey(id)) {
      Runtime.trap("Homepage image not found");
    };
    homepageImages.remove(id);
  };

  public query ({ caller }) func getOrganizationDetails() : async OrganizationDetails {
    organizationDetails;
  };

  public query ({ caller }) func getAboutUsContent() : async BilingualText {
    aboutUsContent;
  };

  public query ({ caller }) func getDonationDetails() : async DonationDetails {
    donationDetails;
  };

  public query ({ caller }) func getProjects() : async [Project] {
    projects.values().toArray();
  };

  public query ({ caller }) func getGalleryImages() : async [GalleryImage] {
    galleryImages.values().toArray();
  };

  public query ({ caller }) func getHomepageImages() : async [GalleryImage] {
    homepageImages.values().toArray();
  };

  // MEMBER MANAGEMENT
  public shared ({ caller }) func addMember(sessionToken : Text, member : Member) : async () {
    if (not isValidSession(sessionToken)) {
      Runtime.trap("Unauthorized: Invalid session token");
    };
    members.add(member.id, member);
  };

  public shared ({ caller }) func updateMember(sessionToken : Text, member : Member) : async () {
    if (not isValidSession(sessionToken)) {
      Runtime.trap("Unauthorized: Invalid session token");
    };
    if (not members.containsKey(member.id)) {
      Runtime.trap("Member not found");
    };
    members.add(member.id, member);
  };

  public shared ({ caller }) func deleteMember(sessionToken : Text, id : Text) : async () {
    if (not isValidSession(sessionToken)) {
      Runtime.trap("Unauthorized: Invalid session token");
    };
    if (not members.containsKey(id)) {
      Runtime.trap("Member not found");
    };
    members.remove(id);
  };

  public query ({ caller }) func getMembers() : async [Member] {
    members.values().toArray();
  };

  // CONTACT MESSAGES
  public query ({ caller }) func getContactMessages(sessionToken : Text) : async [ContactMessage] {
    if (not isValidSession(sessionToken)) {
      Runtime.trap("Unauthorized: Invalid session token");
    };
    contactMessages.values().toArray();
  };

  public shared ({ caller }) func addContactMessage(message : ContactMessage) : async () {
    contactMessages.add(message.id, message);
  };

  // USER PROFILE MANAGEMENT
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
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
};
