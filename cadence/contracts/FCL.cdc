pub contract FCL {
  pub let storagePath: StoragePath

  pub struct Account {
    pub let type: String
    pub let address: Address
    pub let keyId: Int
    pub var label: String
    pub var scopes: [String]

    init(address: Address, label: String, scopes: [String]) {
      self.type = "ACCOUNT"
      self.address = address
      self.keyId = 0
      self.label = label
      self.scopes = scopes
    }

    pub fun update(label: String, scopes: [String]) {
      self.label = label
      self.scopes = scopes
    }
  }

  pub resource Root {
    pub let key: [UInt8]
    pub let accounts: {Address: Account}

    init (_ key: String) {
      self.key = key.decodeHex()
      self.accounts = {}
    }

    pub fun add(_ acct: Account) {
      self.accounts[acct.address] = acct
    }

    pub fun update(address: Address, label: String, scopes: [String]) {
      let acct = self.accounts[address]
      acct!.update(label: label, scopes: scopes)
      self.accounts[address] = acct
    }
  }

  pub fun accounts(): {Address: Account} {
    return self.account.borrow<&Root>(from: self.storagePath)!.accounts
  }

  pub fun getServiceKey(): [UInt8] {
    return self.account.borrow<&Root>(from: self.storagePath)!.key
  }

  pub fun newServiceAccount(): AuthAccount {
    let acct = AuthAccount(payer: self.account)
    acct.addPublicKey(self.getServiceKey())

    self.account
      .borrow<&Root>(from: self.storagePath)!
      .add(Account(address: self.account.address, label: "Service Account", scopes: []))

    return acct
  }

  pub fun new(label: String, scopes: [String]): AuthAccount {
    let acct = AuthAccount(payer: self.account)
    acct.addPublicKey(self.getServiceKey())

    self.account
      .borrow<&Root>(from: self.storagePath)!
      .add(Account(address: acct.address, label: label, scopes: scopes))

    return acct
  }

  pub fun update(address: Address, label: String, scopes: [String]) {
    self.account.borrow<&Root>(from: self.storagePath)!
      .update(address: address, label: label, scopes: scopes)
  }

  init (key: String) {
    self.storagePath = /storage/FCL_DEV_WALLET
    self.account.save(<- create Root(key), to: self.storagePath)

    log(self.newServiceAccount())
    log(self.new(label: "", scopes: []))
    log(self.new(label: "", scopes: []))
    log(self.new(label: "", scopes: []))
  }
}
