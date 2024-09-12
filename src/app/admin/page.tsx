"use client";
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';

const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PRIVATE_KEY;

const AdminPage = () => {
    const { toast } = useToast();
    const [fileName, setFileName] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [fileTitle, setFileTitle] = useState('');
    const [uploadTitle, setUploadTitle] = useState('');
    const [fileList, setFileList] = useState([]);
    const [dragging, setDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = (files: FileList | null) => {
        if (files && files.length > 0) {
            const file = files[0];
            setFileName(file.name);
            setSelectedFile(file);
            toast({
                title: 'File selected',
                description: 'Your file has been selected for upload.',
                className: "bg-green-100 border-green-400 text-green-700"
            });
            console.log('Selected file:', file.name);
        }
    };

    const fetchFileList = async () => {
        if (!VAPI_PUBLIC_KEY) {
            console.error('VAPI_PUBLIC_KEY is not set');
            toast({
                title: "Error",
                description: "Vapi client is not initialized.",
                duration: 3000,
                variant: "destructive",
            })
            return;
        }
        try {
            const response = await fetch('https://api.vapi.ai/file', {
                method: 'GET',
                headers: {
                    // 'Authorization': `Bearer ${VAPI_PUBLIC_KEY}`
                    Authorization: `Bearer ${VAPI_PUBLIC_KEY}`
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setFileList(data); // Assuming the API returns an array of file objects
        } catch (error) {
            console.error('Error fetching file list:', error);
            // Optionally, you can set a default list or show an error message
        }
    };



    useEffect(() => {
        fetchFileList();
    }, []);


    const handleSave = async () => {
        setIsLoading(true);
        if (!selectedFile) {
            toast({
                title: "Error",
                description: "Please select a file to upload.",
                variant: "destructive",
            });
            return;
        }

        setIsUploading(true);

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('name', uploadTitle || selectedFile.name);

        try {
            const response = await fetch('https://api.vapi.ai/file', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${VAPI_PUBLIC_KEY}`
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const result = await response.json();
            console.log('Upload successful:', result);

            toast({
                title: "Success",
                description: "File uploaded successfully.",
                className: "bg-green-100 border-green-400 text-green-700"
            });

            // Reset form and close dialog
            setFileName(null);
            setSelectedFile(null);
            setUploadTitle('');
            // Close the dialog here if you have a state for it

            // Refresh the file list
            fetchFileList();
        } catch (error) {
            console.error('Error uploading file:', error);
            toast({
                title: "Error",
                description: "Failed to upload file. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setDragging(false);
        handleFileUpload(event.dataTransfer.files);
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setDragging(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setDragging(false);
    };

    const openFileDialog = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };
    function formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    }


    const handleSaveSettings = () => {
        // Save the first message to localStorage
        localStorage.setItem('firstMessage', fileTitle);
        toast({
            title: "Success",
            description: "Settings saved successfully.",
            className: "bg-green-100 border-green-400 text-green-700"
        });
    };

    return (
        <div className="admin-form-container bg-admin p-6 ">
            <div className="form-container p-4 rounded-3xl space-y-10">
                <div className="form-group mb-6">
                    <label htmlFor="file-title" className="block mb-2">First Message</label>
                    <Textarea
                        id="file-title"
                        placeholder="Hai, this is AI voice assistant, can I help you today?"
                        value={fileTitle}
                        onChange={(e) => setFileTitle(e.target.value)}
                        className="w-full border-none bg-[#474747ce] h-32 max-h-96 placeholder-white"
                    />
                </div>

                <div className="form-group mb-6">
                    <label htmlFor="upload-file" className="block mb-2">Upload File</label>
                    <p className="text-xs text-gray-400 mb-2">
                        Supported formats: PDF,DOCX
                    </p>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="flex border-none items-center bg-green-600 hover:bg-green-700">
                                <img src="svg/upload.svg" className="h-4 w-4 mr-2 text-white" color="white" />
                                <span className="text-white">Add File</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#1b1b1bde] border-none">
                            <DialogHeader>
                                <DialogTitle>Upload File</DialogTitle>
                            </DialogHeader>
                            <div className='space-y-10'>
                                <div>
                                    <label htmlFor='Title-input'>Title</label>
                                    <Input
                                        id='Title-input'
                                        type="text"
                                        placeholder="Enter title here"
                                        className="mb-4 bg-[#3a3a3a] border-none"
                                        value={uploadTitle}
                                        onChange={(e) => setUploadTitle(e.target.value)}
                                    />
                                </div>

                                {/* file upload */}
                                <div
                                    className={`border-2 h-56 items-center flex flex-col justify-center space-y-6 border-dashed rounded-xl p-4 text-center ${dragging ? 'border-blue-500' : 'border-gray-700'}`}
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                >
                                    <p>Drag and drop your file here or</p>
                                    <Button onClick={openFileDialog} variant="secondary" className="mt-2 bg-[#3a3a3a] hover:bg-[#3a3a3a] text-white">
                                        Click to select file
                                    </Button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={(e) => handleFileUpload(e.target.files)}
                                        className="hidden"
                                    />
                                    {fileName && (
                                        <p className="text-sm text-gray-300 mt-2">Selected: {fileName}</p>
                                    )}
                                </div>
                                <Button 
                                    onClick={handleSave} 
                                    className="mt-4 bg-green-600 hover:bg-green-700 w-full"
                                    disabled={isUploading}
                                >
                                    {isUploading ? (
                                        <>
                                            Uploading...
                                        </>
                                    ) : (
                                        'Save'
                                    )}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <Button onClick={handleSaveSettings} className="bg-blue-500 w-full text-white hover:bg-blue-600">
                    Save Settings
                </Button>
            </div>

            <div className="">
                <label className="block mb-2">List Document</label>
                <table className="w-[37vw] border-collapse border border-gray-300">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 p-2">No.</th>
                            <th className="border border-gray-300 p-2">File Name</th>
                            <th className="border border-gray-300 p-2 ">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fileList.map((file: any, index) => (
                            <tr key={index}>
                                <td className="border border-gray-300 p-2">{index + 1}</td>
                                <td className="border border-gray-300 p-2">{file.name}</td>
                                <td className="border border-gray-300 p-2">{formatDate(file.createdAt)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>


        </div>
    );
};

export default AdminPage;