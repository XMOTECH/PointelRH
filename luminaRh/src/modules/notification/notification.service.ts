import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface NotificationResource {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: Date;
}

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Récupère toutes les notifications in-app d'un utilisateur triées par date décroissante.
   */
  async findAllForUser(userId: string): Promise<NotificationResource[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return notifications.map((n) => this.mapToResource(n));
  }

  /**
   * Marque une notification spécifique comme lue après vérification de propriété.
   */
  async markAsRead(userId: string, id: string): Promise<NotificationResource> {
    await this.ensureOwned(userId, id);

    const updated = await this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return this.mapToResource(updated);
  }

  /**
   * Marque toutes les notifications non-lues de l'utilisateur comme lues.
   */
  async markAllAsRead(userId: string): Promise<{ success: boolean }> {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { success: true };
  }

  /**
   * Supprime une notification après vérification de propriété.
   */
  async remove(userId: string, id: string): Promise<{ success: boolean }> {
    await this.ensureOwned(userId, id);

    await this.prisma.notification.delete({
      where: { id },
    });

    return { success: true };
  }

  /**
   * Création programmatique d'une notification in-app.
   */
  async create(data: {
    userId: string;
    title: string;
    message: string;
    type?: string;
  }): Promise<NotificationResource> {
    const notification = await this.prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type || 'INFO',
        isRead: false,
      },
    });

    return this.mapToResource(notification);
  }

  private async ensureOwned(userId: string, id: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification introuvable');
    }

    return notification;
  }

  private mapToResource(n: {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: Date;
  }): NotificationResource {
    return {
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      is_read: n.isRead,
      created_at: n.createdAt,
    };
  }
}
