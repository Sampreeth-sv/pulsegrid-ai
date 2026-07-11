// Volunteer Service
import { initialVolunteers } from '../data/mockData';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let volunteers = JSON.parse(JSON.stringify(initialVolunteers));
let subscribers = [];

const updateVolunteerMetrics = (v) => {
  // Simulate fatigue growth and workload
  v.fatigueScore = Math.min(100, v.fatigueScore + (Math.random() * 0.5 - 0.1));
  v.workloadHours = Math.min(12, v.workloadHours + (Math.random() * 0.01));
  return v;
};

export const volunteerService = {
  async getAll() {
    await sleep(100);
    return JSON.parse(JSON.stringify(volunteers));
  },

  async getById(id) {
    await sleep(50);
    return volunteers.find((v) => v.id === id) || null;
  },

  async getAvailable(requiredSkills = []) {
    await sleep(150);
    return volunteers.filter((v) => {
      if (!v.availability || v.status === 'ON_BREAK') return false;
      if (requiredSkills.length === 0) return true;
      return requiredSkills.some((skill) => v.skills.some((s) => s.toLowerCase().includes(skill.toLowerCase())));
    });
  },

  async assignVolunteer(volunteerId, taskDescription, location) {
    await sleep(200 + Math.random() * 100);
    const vol = volunteers.find((v) => v.id === volunteerId);
    if (!vol) return { success: false, error: 'Volunteer not found' };
    vol.currentTask = taskDescription;
    vol.status = 'DEPLOYED';
    vol.availability = false;
    subscribers.forEach((fn) => fn(JSON.parse(JSON.stringify(volunteers))));
    return { success: true, volunteer: vol, message: `${vol.name} assigned to: ${taskDescription}` };
  },

  async releaseVolunteer(volunteerId) {
    await sleep(100);
    const vol = volunteers.find((v) => v.id === volunteerId);
    if (!vol) return { success: false };
    vol.status = 'ACTIVE';
    vol.availability = true;
    vol.currentTask = 'Standing by';
    subscribers.forEach((fn) => fn(JSON.parse(JSON.stringify(volunteers))));
    return { success: true };
  },

  async updateFatigueScores() {
    await sleep(100);
    volunteers = volunteers.map(updateVolunteerMetrics);
    subscribers.forEach((fn) => fn(JSON.parse(JSON.stringify(volunteers))));
    return volunteers;
  },

  async getUtilizationStats() {
    await sleep(150);
    const total = volunteers.length;
    const active = volunteers.filter((v) => v.status === 'ACTIVE').length;
    const deployed = volunteers.filter((v) => v.status === 'DEPLOYED').length;
    const onBreak = volunteers.filter((v) => v.status === 'ON_BREAK').length;
    const avgFatigue = Math.round(volunteers.reduce((s, v) => s + v.fatigueScore, 0) / total);
    const highFatigue = volunteers.filter((v) => v.fatigueScore > 70).length;
    return { total, active, deployed, onBreak, avgFatigue, highFatigue, utilizationRate: Math.round((deployed + active) / total * 100) };
  },

  subscribe(fn) {
    subscribers.push(fn);
    fn(JSON.parse(JSON.stringify(volunteers)));
    return () => { subscribers = subscribers.filter((s) => s !== fn); };
  },

  reset() {
    volunteers = JSON.parse(JSON.stringify(initialVolunteers));
    subscribers.forEach((fn) => fn(JSON.parse(JSON.stringify(volunteers))));
  },
};

export default volunteerService;
