import { Service, Incident, TimelineEvent, StatusApiResponse } from './types';
import { formatDistanceToNow, subMinutes, subHours, subDays } from 'date-fns';
import axios from 'axios'

const now = new Date();

// Fetch services data
export const fetchServices = async () => {
  try {
    console.log("fetching services")
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/services/list`)
    console.log("response", response)
    console.log('Services:', response.data)
    return response.data
  } catch (error) {
    console.error('Error fetching services:', error)
    return []
  }
}

export const mockServices: Service[] = [
  // {
  //   id: '1',
  //   name: 'API Service',
  //   status: 'operational',
  //   lastChecked: now.toISOString(),
  // },
  // {
  //   id: '2',
  //   name: 'Web Dashboard',
  //   status: 'operational',
  //   lastChecked: now.toISOString(),
  // },
  // {
  //   id: '3',
  //   name: 'Authentication',
  //   status: 'degraded',
  //   lastChecked: subMinutes(now, 5).toISOString(),
  // },
  // {
  //   id: '4',
  //   name: 'Database Cluster',
  //   status: 'operational',
  //   lastChecked: now.toISOString(),
  // },
  // {
  //   id: '5',
  //   name: 'Storage Service',
  //   status: 'operational',
  //   lastChecked: subMinutes(now, 2).toISOString(),
  // },
  // {
  //   id: '6',
  //   name: 'Notification System',
  //   status: 'outage',
  //   lastChecked: subMinutes(now, 15).toISOString(),
  // },
  // {
  //   id: '7',
  //   name: 'CDN',
  //   status: 'operational',
  //   lastChecked: subMinutes(now, 1).toISOString(),
  // },
  // {
  //   id: '8',
  //   name: 'Analytics',
  //   status: 'operational',
  //   lastChecked: now.toISOString(),
  // },
];

export const mockIncidents: Incident[] = [
  {
    id: '1',
    title: 'Authentication Service Degraded Performance',
    status: 'investigating',
    createdAt: subHours(now, 1).toISOString(),
    updatedAt: subMinutes(now, 10).toISOString(),
    affectedServices: ['3'],
    updates: [
      {
        id: '1-1',
        timestamp: subHours(now, 1).toISOString(),
        message: 'We are investigating reports of slow response times from the authentication service.',
        status: 'investigating',
      },
      {
        id: '1-2',
        timestamp: subMinutes(now, 30).toISOString(),
        message: 'We have identified the issue as increased database load due to a recent deployment.',
        status: 'identified',
      },
      {
        id: '1-3',
        timestamp: subMinutes(now, 10).toISOString(),
        message: 'We have applied a fix and are monitoring the service for stability.',
        status: 'monitoring',
      },
    ],
  },
  {
    id: '2',
    title: 'Notification System Outage',
    status: 'identified',
    createdAt: subHours(now, 2).toISOString(),
    updatedAt: subMinutes(now, 5).toISOString(),
    affectedServices: ['6'],
    updates: [
      {
        id: '2-1',
        timestamp: subHours(now, 2).toISOString(),
        message: 'We are investigating reports of notifications not being delivered.',
        status: 'investigating',
      },
      {
        id: '2-2',
        timestamp: subMinutes(now, 45).toISOString(),
        message: 'We have identified a critical failure in our message queue system.',
        status: 'identified',
      },
      {
        id: '2-3',
        timestamp: subMinutes(now, 5).toISOString(),
        message: 'Our engineers are working to restore service. We will provide another update within 30 minutes.',
        status: 'identified',
      },
    ],
  },
];

export const mockTimelineEvents: TimelineEvent[] = [
  {
    id: '1',
    timestamp: subHours(now, 2).toISOString(),
    type: 'incident_created',
    description: 'Notification System Outage began',
    incidentId: '2',
  },
  {
    id: '2',
    timestamp: subHours(now, 1).toISOString(),
    type: 'incident_created',
    description: 'Authentication Service Degraded Performance began',
    incidentId: '1',
  },
  {
    id: '3',
    timestamp: subMinutes(now, 45).toISOString(),
    type: 'status_updated',
    description: 'Notification System Outage - Root cause identified',
    incidentId: '2',
  },
  {
    id: '4',
    timestamp: subMinutes(now, 30).toISOString(),
    type: 'status_updated',
    description: 'Authentication Service - Issue identified',
    incidentId: '1',
  },
  {
    id: '5',
    timestamp: subDays(now, 1).toISOString(),
    type: 'resolved',
    description: 'API Rate Limiting Issue Resolved',
  },
  {
    id: '6',
    timestamp: subDays(now, 2).toISOString(),
    type: 'resolved',
    description: 'CDN Propagation Delay Resolved',
  },
];

export const getMockData = (): StatusApiResponse => {
  return {
    services: mockServices,
    incidents: mockIncidents,
    activeIncidents: mockIncidents.filter(incident => incident.status !== 'resolved'),
    timelineEvents: mockTimelineEvents,
  };
};

export const getRelativeTimeString = (dateString: string): string => {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
};
