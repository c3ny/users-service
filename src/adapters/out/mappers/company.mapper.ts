import { Company } from '@/application/core/domain/company.entity';
import { Companies } from '../domain/company.entity';

export type CompanyPersistence = Omit<Company, 'id' | 'fkUserId'> & {
  user: { id: string };
};

export type CompanyPersistenceWithId = CompanyPersistence & { id: string };

export class CompanyMapper {
  static toDomain(company: Companies): Company {
    return {
      id: company.id,
      cnpj: company.cnpj,
      institutionName: company.institutionName,
      cnes: company.cnes,
      fkUserId: company.user.id,
      slug: company.slug,
      type: company.type ?? undefined,
      status: company.status ?? undefined,
      description: company.description ?? undefined,
      bannerImage: company.bannerImage ?? undefined,
      logoImage: company.logoImage ?? undefined,
      phone: company.phone ?? undefined,
      whatsapp: company.whatsapp ?? undefined,
      contactEmail: company.contactEmail ?? undefined,
      website: company.website ?? undefined,
      address: company.address ?? undefined,
      neighborhood: company.neighborhood ?? undefined,
      city: company.city ?? undefined,
      uf: company.uf ?? undefined,
      zipcode: company.zipcode ?? undefined,
      latitude: company.latitude ?? undefined,
      longitude: company.longitude ?? undefined,
      schedule: company.schedule ?? undefined,
      acceptsDonations: company.acceptsDonations,
      acceptsScheduling: company.acceptsScheduling,
    };
  }

  static toPersistence(company: Omit<Company, 'id'>): CompanyPersistence {
    return {
      cnpj: company.cnpj,
      institutionName: company.institutionName,
      cnes: company.cnes,
      slug: company.slug,
      type: company.type,
      status: company.status,
      description: company.description,
      bannerImage: company.bannerImage,
      logoImage: company.logoImage,
      phone: company.phone,
      whatsapp: company.whatsapp,
      contactEmail: company.contactEmail,
      website: company.website,
      address: company.address,
      neighborhood: company.neighborhood,
      city: company.city,
      uf: company.uf,
      zipcode: company.zipcode,
      latitude: company.latitude,
      longitude: company.longitude,
      schedule: company.schedule,
      acceptsDonations: company.acceptsDonations,
      acceptsScheduling: company.acceptsScheduling,
      user: { id: company.fkUserId },
    };
  }

  static toPersistenceWithId(company: Company): CompanyPersistenceWithId {
    return {
      id: company.id,
      ...CompanyMapper.toPersistence(company),
    };
  }

  /**
   * Maps a TypeORM entity to domain without requiring the `user` relation.
   * Used for public list endpoints where fkUserId is not needed.
   */
  static toPublicListItem(company: Companies): Company {
    return {
      id: company.id,
      cnpj: company.cnpj,
      institutionName: company.institutionName,
      cnes: company.cnes,
      fkUserId: '',
      slug: company.slug,
      type: company.type ?? undefined,
      status: company.status ?? undefined,
      description: company.description ?? undefined,
      bannerImage: company.bannerImage ?? undefined,
      logoImage: company.logoImage ?? undefined,
      phone: company.phone ?? undefined,
      whatsapp: company.whatsapp ?? undefined,
      contactEmail: company.contactEmail ?? undefined,
      website: company.website ?? undefined,
      address: company.address ?? undefined,
      neighborhood: company.neighborhood ?? undefined,
      city: company.city ?? undefined,
      uf: company.uf ?? undefined,
      zipcode: company.zipcode ?? undefined,
      latitude: company.latitude ?? undefined,
      longitude: company.longitude ?? undefined,
      schedule: company.schedule ?? undefined,
      acceptsDonations: company.acceptsDonations,
      acceptsScheduling: company.acceptsScheduling,
    };
  }
}
