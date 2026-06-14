'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProject, updateProject, deleteProject } from '@/actions/project.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ArrowLeft, Trash2 } from 'lucide-react';

export default function ProjectSettingsPage() {
  const { projectId } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const data = await getProject(projectId as string);
      setProject({ ...data, startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '', endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : '' });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [projectId]);

  async function handleSave() {
    if (!project) return;
    setSaving(true);
    try {
      const data: any = {};
      if (project.name) data.name = project.name;
      if (project.description !== undefined) data.description = project.description;
      if (project.status) data.status = project.status;
      data.startDate = project.startDate || null;
      data.endDate = project.endDate || null;
      await updateProject(projectId as string, data);
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!confirm('Tem certeza? Esta ação não pode ser desfeita.')) return;
    try { await deleteProject(projectId as string); router.push('/projects'); }
    catch (e) { console.error(e); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!project) return <div className="text-center py-20"><p className="text-muted-foreground">Projeto não encontrado</p></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold">Configurações</h1>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="danger">Perigo</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle>Informações do Projeto</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Nome</label>
                <Input value={project.name} onChange={(e) => setProject({ ...project, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Descrição</label>
                <Textarea value={project.description || ''} onChange={(e) => setProject({ ...project, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Data Início</label>
                  <Input type="date" value={project.startDate} onChange={(e) => setProject({ ...project, startDate: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Data Término</label>
                  <Input type="date" value={project.endDate} onChange={(e) => setProject({ ...project, endDate: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select value={project.status} onValueChange={(v) => setProject({ ...project, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PLANNING">Planejamento</SelectItem>
                    <SelectItem value="ACTIVE">Ativo</SelectItem>
                    <SelectItem value="COMPLETED">Concluído</SelectItem>
                    <SelectItem value="ARCHIVED">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar alterações'}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="danger" className="space-y-4 mt-4">
          <Card className="border-red-200 dark:border-red-900">
            <CardHeader><CardTitle className="text-red-600">Zona de Perigo</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Ao excluir o projeto, todos os dados serão perdidos permanentemente.</p>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />Excluir Projeto
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
