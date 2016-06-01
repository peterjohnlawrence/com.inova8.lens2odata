package com.inova8.lens2odata.utils;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.security.Principal;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.FileUtils;

/**
 * Servlet implementation class JSONUploadServlet
 */
@WebServlet("/JSONUploadServlet")
public class JSONServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private File file;
	private static final String INOVA8_DIRECTORY = "..\\..\\inova8";
	private static final String CONFIG_DIRECTORY = "\\config";

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public JSONServlet() {
		super();
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		 response.setContentType("json");
			String uploadPath = getServletContext().getRealPath("") + File.separator  + INOVA8_DIRECTORY + CONFIG_DIRECTORY
					+ File.separator;			
			String fileName = request.getParameter("filename") ;
			Principal user = request.getUserPrincipal();
			if (fileName.lastIndexOf("\\") >= 0) {
				file = new File(uploadPath + user.getName() + File.separator + 
						fileName.substring(fileName.lastIndexOf("\\")));
			} else {
				file = new File(uploadPath + user.getName() + File.separator +  
						fileName.substring(fileName.lastIndexOf("\\") + 1));
			}

	      PrintWriter out = response.getWriter();
          try{
        	  out.println(  FileUtils.readFileToString(file) );
          }catch( Exception e){
        	  out.println(  "" ); 
          }
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException,
			IOException {

		String json = request.getParameter("data");
		Principal user = request.getUserPrincipal();

		// constructs the directory path to store upload file
		// this path is relative to application's directory
		// Each user will be assigned a separate folder
		String inova8Path = getServletContext().getRealPath("") + File.separator +  INOVA8_DIRECTORY;
		String configPath =inova8Path+CONFIG_DIRECTORY;
		String userPath =configPath+ File.separator + user.getName() + File.separator;

		// creates the directory if it does not exist
		File inova8Dir = new File(inova8Path);
		if (!inova8Dir.exists()) {
			inova8Dir.mkdir();
		}
		File configDir = new File(configPath);
		if (!configDir.exists()) {
			configDir.mkdir();
		}
		File userDir = new File(userPath);
		if (!userDir.exists()) {
			userDir.mkdir();
		}

		try {
			String fileName = request.getParameter("filename");
			if (fileName.lastIndexOf("\\") >= 0) {
				file = new File(userPath +  fileName.substring(fileName.lastIndexOf("\\")));
			} else {
				file = new File(userPath +  fileName.substring(fileName.lastIndexOf("\\") + 1));
			}
			FileWriter fw = new FileWriter(file.getAbsoluteFile());
			BufferedWriter bw = new BufferedWriter(fw);
			bw.write(json);
			bw.close();

		} catch (Exception ex) {
			System.out.println(ex);
		}

	}

}
