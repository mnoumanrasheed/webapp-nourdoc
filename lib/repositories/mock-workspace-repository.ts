import { clinicians, doctorOverview, encounters, hospitalOverview, reports } from "@/lib/demo-data";
import type { WorkspaceRepository } from "./workspace-repository";

export const mockWorkspaceRepository: WorkspaceRepository = {
  async getHospitalOverview(period, hospitalId) {
    return hospitalOverview(period, hospitalId);
  },
  async listHospitalDoctors(hospitalId) {
    return clinicians.filter(item => item.hospitalId === hospitalId);
  },
  async getHospitalDoctor(hospitalId, doctorId) {
    return clinicians.find(item => item.hospitalId === hospitalId && item.id === doctorId) ?? null;
  },
  async getDoctorOverview(period, user) {
    return doctorOverview(period, user);
  },
  async listDoctorEncounters(user) {
    return encounters.filter(item => item.hospitalId === user.hospitalId && item.doctorId === user.doctorId);
  },
  async getDoctorEncounter(user, encounterId) {
    return encounters.find(item => item.id === encounterId && item.hospitalId === user.hospitalId && item.doctorId === user.doctorId) ?? null;
  },
  async getClinicalReport(user, reportId) {
    return reports.find(item => item.id === reportId && item.hospitalId === user.hospitalId && item.doctorId === user.doctorId) ?? null;
  },
  async mutateDemoReport(_user, input) {
    return { previewOnly: true, transition: input.transition };
  },
};
