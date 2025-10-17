import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '../../Firebase/Firebase';
import type { Notification,NotificationFormData } from '../../types/NotificationForm';



export interface FirebaseNotification {
  id: string;
  title: string;
  message: string;
  imageUrl?: string;
  type: 'info' | 'warning' | 'success' | 'error';
  senderId: string;
  senderName: string;
  targetUsers: 'all' | string[];
  createdAt: Timestamp;
  readBy: string[]; 
}

class NotificationService {
  async sendNotification(
    formData: NotificationFormData, 
    sender: { id: string; name: string; isAdmin: boolean }
  ): Promise<boolean> {
    try {
      if (!sender.isAdmin) {
        throw new Error('Apenas administradores podem enviar notificações');
      }

      let imageUrl = '';
      
      if (formData.image) {
        imageUrl = await this.uploadImage(formData.image);
      }

      const targetUsers = formData.targetUsers === 'all' ? 'all' : formData.specificUsers || [];

      const notificationData = {
        title: formData.title,
        message: formData.message,
        imageUrl: imageUrl || null,
        type: formData.type,
        senderId: sender.id,
        senderName: sender.name,
        targetUsers: targetUsers,
        readBy: [], 
        createdAt: Timestamp.now()
      };

      await addDoc(collection(db, 'notifications'), notificationData);
      
      console.log('📢 Notificação enviada com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar notificação:', error);
      throw error;
    }
  }

  private async uploadImage(file: File): Promise<string> {
 
    return URL.createObjectURL(file);
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const notificationsQuery = query(
        collection(db, 'notifications'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(notificationsQuery);
      const notifications: Notification[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirebaseNotification;
        
        const isForUser = data.targetUsers === 'all' || 
                         (Array.isArray(data.targetUsers) && data.targetUsers.includes(userId));

        if (isForUser) {
          notifications.push({
            id: doc.id,
            title: data.title,
            message: data.message,
            image: data.imageUrl,
            type: data.type,
            timestamp: data.createdAt.toDate(),
            read: data.readBy.includes(userId)
          });
        }
      });

      return notifications;
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      return [];
    }
  }

  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        readBy: arrayUnion(userId)
      });
      return true;
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      return false;
    }
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('readBy', 'array-contains', userId)
      );

      const querySnapshot = await getDocs(notificationsQuery);
      const updatePromises = querySnapshot.docs.map(async (docSnapshot) => {
        const notificationRef = doc(db, 'notifications', docSnapshot.id);
        await updateDoc(notificationRef, {
          readBy: arrayUnion(userId)
        });
      });

      await Promise.all(updatePromises);
      return true;
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      return false;
    }
  }

  subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void) {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(notificationsQuery, (querySnapshot) => {
      const notifications: Notification[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirebaseNotification;
        
        const isForUser = data.targetUsers === 'all' || 
                         (Array.isArray(data.targetUsers) && data.targetUsers.includes(userId));

        if (isForUser) {
          notifications.push({
            id: doc.id,
            title: data.title,
            message: data.message,
            image: data.imageUrl,
            type: data.type,
            timestamp: data.createdAt.toDate(),
            read: data.readBy.includes(userId)
          });
        }
      });

      callback(notifications);
    });
  }
}

export const notificationService = new NotificationService();