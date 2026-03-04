module {
  type OldActor = {
    // Persistent fields in the old actor
  };

  type NewActor = {
    customDomain : ?Text;
  };

  public func run(old : OldActor) : NewActor {
    { customDomain = null };
  };
};
