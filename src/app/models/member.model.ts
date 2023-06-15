interface Geo {
  lat: string;
  lng: string;
}

interface Address {
  street: string;
  suite: string;
  city: string;
  zipcode: string;
  geo: Geo;
}

interface Company {
  name: string;
  catchPhrase: string;
  bs: string;
}

export interface Member {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  address: Address;
  website: string;
  company: Company;
}
